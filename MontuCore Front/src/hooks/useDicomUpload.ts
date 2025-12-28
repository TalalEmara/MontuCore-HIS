import { useState } from 'react';
import axios from 'axios';

interface UploadResult {
  id: number;
  caseId: number;
  modality: string;
  bodyPart: string;
  status: string;
  pacsImages: Array<{
    id: number;
    fileName: string;
    publicUrl: string;
  }>;
}

interface UseDicomUploadReturn {
  uploadToNewExam: (files: FileList | File[], caseId: number, examData?: any) => Promise<UploadResult>;
  uploadToExistingExam: (files: FileList | File[], examId: number) => Promise<UploadResult>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useDicomUpload = (): UseDicomUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToNewExam = async (files: FileList | File[], caseId: number, examData: any = {}) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add exam data
      formData.append('caseId', caseId.toString());
      if (examData.modality) formData.append('modality', examData.modality);
      if (examData.bodyPart) formData.append('bodyPart', examData.bodyPart);
      if (examData.status) formData.append('status', examData.status);
      if (examData.scheduledAt) formData.append('scheduledAt', examData.scheduledAt);
      if (examData.performedAt) formData.append('performedAt', examData.performedAt);
      if (examData.radiologistNotes) formData.append('radiologistNotes', examData.radiologistNotes);
      if (examData.conclusion) formData.append('conclusion', examData.conclusion);
      if (examData.cost) formData.append('cost', examData.cost.toString());

      // Add DICOM files
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        formData.append('dicomFiles', file);
      });

      setUploadProgress(25); // Form data prepared

      const response = await axios.post('/api/exams/with-multiple-dicoms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 75) / progressEvent.total!);
          setUploadProgress(25 + percentCompleted); // 25% + upload progress
        },
      });

      setUploadProgress(100); // Complete

      return response.data.data;

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToExistingExam = async (files: FileList | File[], examId: number) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add exam ID
      formData.append('examId', examId.toString());

      // Add DICOM files
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        formData.append('dicomFiles', file);
      });

      setUploadProgress(25); // Form data prepared

      const response = await axios.post('/api/exams/with-multiple-dicoms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 75) / progressEvent.total!);
          setUploadProgress(25 + percentCompleted); // 25% + upload progress
        },
      });

      setUploadProgress(100); // Complete

      return response.data.data;

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToNewExam,
    uploadToExistingExam,
    isUploading,
    uploadProgress,
    error
  };
};