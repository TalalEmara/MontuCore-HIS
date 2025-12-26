// path: hooks/DicomViewer/useDicomURL.ts
import { useState, useCallback } from 'react';

interface ExamResponse {
  success: boolean;
  data: {
    id: number;
    dicomPublicUrl: string | null;
    [key: string]: any;
  };
}

// 1. Accept callback + optional API URL (defaulting to localhost:3000)
export const useDicomURL = (
  onUrlProcessed: (imageIds: string[]) => void, 
  apiUrl: string = 'http://localhost:3000'
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDicomUrl = useCallback(async (examId: number | string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 2. Construct the full endpoint
      // Removes trailing slash from apiUrl if present to avoid double slashes
      const cleanBase = apiUrl.replace(/\/$/, '');
      const endpoint = `${cleanBase}/api/exams/${examId}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Error fetching exam: ${response.statusText}`);
      }

      const result: ExamResponse = await response.json();

      // 3. Extract URL
      const publicUrl = result.data?.dicomPublicUrl;

      if (!result.success || !publicUrl) {
        throw new Error('No DICOM URL found in this exam record.');
      }

      // 4. Format for Cornerstone WADO Loader
      // Prepend 'wadouri:' so Cornerstone loads via HTTP request
      const wadoId = `wadouri:${publicUrl}`;
      const newImageIds = [wadoId];

      // 5. Trigger the parent callback (Just like handleFileChange)
      onUrlProcessed(newImageIds);

    } catch (err: any) {
      console.error("Dicom Fetch Error:", err);
      setError(err.message || "Failed to load DICOM URL");
    } finally {
      setIsLoading(false);
    }

  }, [onUrlProcessed, apiUrl]);

  return {
    fetchDicomUrl,
    isLoading,
    error,
  };
};