// hooks/DicomViewer/useDicomUrlHandler.ts
import { useCallback } from 'react';
import dicomParser from 'dicom-parser';

export const useDicomUrlHandler = (onFileProcessed: (imageIds: string[]) => void) => {
  const handleUrls = useCallback(async (urls: string[]) => {
    // Filter out empty/null URLs
    const validUrls = urls.filter(url => url && url.trim());

    if (validUrls.length === 0) {
      console.warn('No valid DICOM URLs provided');
      return;
    }

    try {
      const allImageIds: string[] = [];

      for (const url of validUrls) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch DICOM from ${url}: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const file = new File([arrayBuffer], 'dicom.dcm', { type: 'application/dicom' });
        const fileUrl = URL.createObjectURL(file);

        // Parse DICOM metadata to determine number of frames
        let numberOfFrames = 1;
        try {
          const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));
          numberOfFrames = parseInt(dataSet.string('x00280008')) || 1;
        } catch (parseError) {
          console.warn(`Failed to parse DICOM metadata from ${url}, assuming single frame:`, parseError);
        }

        // Generate imageIds for each frame
        for (let i = 0; i < numberOfFrames; i++) {
          allImageIds.push(`wadouri:${fileUrl}&frame=${i}`);
        }
      }

      onFileProcessed(allImageIds);
    } catch (error) {
      console.error('Error processing DICOM URLs:', error);
    }
  }, [onFileProcessed]);

  return {
    handleUrls,
  };
};;