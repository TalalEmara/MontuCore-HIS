// hooks/DicomViewer/useExamLoader.ts
import { useState, useCallback } from 'react';
import { useDicomUrlHandler } from './useDicomUrlHandler';

export const useExamLoader = (
  onImagesLoaded: (imageIds: string[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initialize the URL handler with the callback
  const { handleUrls } = useDicomUrlHandler(onImagesLoaded);

  // 2. Manual Trigger Function
  // Now accepts the ID as an argument
  const loadExam = useCallback(async (examId: number) => {
    setIsLoading(true);
    console.log('Manually loading DICOM for exam ID:', examId);

    try {
      // Step A: Try API
      const response = await fetch(`http://localhost:3000/api/exams/${examId}`);
      const examData = await response.json();
      
      if (examData.data && examData.data.dicomPublicUrl) {
        console.log('Found DICOM URL via API:', examData.data.dicomPublicUrl);
        await handleUrls([examData.data.dicomPublicUrl]);
      } else {
        // Step B: Fallback
        console.warn('No API URL found. Using local fallback.');
        const localUrl = 'http://localhost:5173/dicom_images/demo_pure_acl_6.dcm';
        await handleUrls([localUrl]);
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleUrls]);

  return {
    loadExam,
    isLoading
  };
};