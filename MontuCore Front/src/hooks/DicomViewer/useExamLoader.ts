import { useState, useCallback } from 'react';

// Define the shape of your API response
interface PacsImage {
  id: number;
  fileName: string; // e.g., "image-00000.dcm"
  publicUrl: string;
  uploadedAt: string;
}

interface ExamData {
  id: number;
  caseId: number;
  modality: string;
  status: string;
  pacsImages: PacsImage[];
  bodyPart: string;       
  performedAt: string;
  radiologistNotes: string | null;
  // Add the nested structure for patient info
  medicalCase?: {
    id: number;
    diagnosisName: string;
    athlete: {
      id: number;
      fullName: string;
      email: string;
    }
  };
}
interface ApiResponse {
  success: boolean;
  data: ExamData;
}

/**
 * Hook to load a full exam (series of DICOMs) from the API.
 * * @param onImagesLoaded Callback that receives the array of 'wadouri:URL' strings
 * @param apiUrl Base API URL (defaults to localhost:3000)
 */
export const useExamLoader = (
  onImagesLoaded: (imageIds: string[]) => void, 
  apiUrl: string = 'http://localhost:3000'
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [examMetadata, setExamMetadata] = useState<ExamData | null>(null);
  const loadExam = useCallback(async (examId: number | string) => {
    if (!examId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Construct Endpoint
      const cleanBase = apiUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanBase}/api/exams/${examId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch exam: ${response.statusText}`);
      }

      const json: ApiResponse = await response.json();

      if (!json.success || !json.data) {
        throw new Error('Invalid response format from server');
      }
      setExamMetadata(json.data);
      const images = json.data.pacsImages || [];

      if (images.length === 0) {
        throw new Error('This exam has no DICOM images attached.');
      }

      // 2. Sort Images (CRITICAL)
      // We must ensure 'image-00000.dcm' comes before 'image-00001.dcm' 
      // otherwise the 3D volume will be scrambled.
      const sortedImages = images.sort((a, b) => 
        a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
      );

      // 3. Map to WADOURI format
      const imageIds = sortedImages.map((img) => `wadouri:${img.publicUrl}`);
      console.log(imageIds);
      // 4. Pass to Viewer
      onImagesLoaded(imageIds);

    } catch (err: any) {
      console.error("Exam Load Error:", err);
      setError(err.message || "Failed to load exam images");
    } finally {
      setIsLoading(false);
    }
  }, [onImagesLoaded, apiUrl]);

  return {
    loadExam,
    examMetadata,
    isLoading,
    error,
  };
};