// path: hooks/DicomViewer/useDicomFileHandler.ts
import { useCallback } from 'react';
import { wadouri } from '@cornerstonejs/dicom-image-loader';

// 1. Accept a callback function as an argument
export const useDicomFileHandler = (onFileProcessed: (imageIds: string[]) => void) => {

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);

    // Register files
    const newImageIds = fileArray.map((file) => {
      return wadouri.fileManager.add(file);
    });

    // 2. Instead of setting local state, call the parent's callback immediately
    onFileProcessed(newImageIds);

    // Optional: Reset input so the same file can be uploaded again if needed
    event.target.value = '';

  }, [onFileProcessed]);

  return {
    handleFileChange,
  };
};