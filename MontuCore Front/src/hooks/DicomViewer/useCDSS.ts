// path: src/hooks/DicomViewer/useDicomAnalysis.ts

import { useState, useCallback } from 'react';

interface AnalysisResponse {
  success: boolean;
  data: {
    diagnosis: {
      primary: string;
      severity: 'normal' | 'low' | 'moderate' | 'high';
      details: string;
      confidence: number;
    };
    // ... add other fields if needed for UI
  };
  message?: string;
}

export const useDicomAnalysis = (apiUrl: string = 'http://localhost:3000') => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeExam = useCallback(async (
    examId: number, 
    patientId: number, 
    pacsImages: any[] // Expects the array of image objects from useExamLoader
  ) => {
    
    if (!pacsImages || pacsImages.length === 0) {
      setError("No images available to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Sort Images to ensure correct "middle" logic
      const sortedImages = [...pacsImages].sort((a, b) => 
        a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
      );

      // 2. Select Middle 3 Slices
      let selectedUrls: string[] = [];
      const total = sortedImages.length;

      if (total <= 3) {
        // If 3 or fewer, send all
        selectedUrls = sortedImages.map(img => img.publicUrl);
      } else {
        const midIndex = Math.floor(total / 2);
        // Take middle-1, middle, middle+1
        const sliceIndices = [midIndex - 1, midIndex, midIndex + 1];
        selectedUrls = sliceIndices.map(idx => sortedImages[idx].publicUrl);
      }

      // 3. Send to Backend
      const cleanBase = apiUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanBase}/api/cdss/analyze-dicom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId,
          patientId,
          dicomUrls: selectedUrls // Sending Array
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "AI Analysis failed");
      }

      setAnalysisResult(json.data);
      return json.data;

    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "Failed to analyze exam");
    } finally {
      setIsAnalyzing(false);
    }
  }, [apiUrl]);

  return {
    analyzeExam,
    isAnalyzing,
    analysisResult,
    error,
  };
};