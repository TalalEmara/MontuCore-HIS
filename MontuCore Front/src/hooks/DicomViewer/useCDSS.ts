import { useMutation } from '@tanstack/react-query';

// 1. Define Interfaces
export interface CDSSDiagnosis {
  primary: string;
  severity: 'normal' | 'low' | 'moderate' | 'high';
  details: string;
  confidence: number;
  acl?: {
    probability: number;
    confidence_level: string;
  };
}

interface CDSSResponse {
  success: boolean;
  diagnosis: CDSSDiagnosis;
  heatmap?: string[];
  abnormal_probability?: number;
  abnormal_detected?: boolean;
  message?: string;
}

interface AnalyzeParams {
  imageIds: string[];
  examId?: number | string;
  patientId?: number | string;
}

export const useCDSS = (apiUrl: string = 'http://localhost:3000') => {
  
  // 2. Setup Mutation
  const mutation = useMutation({
    mutationFn: async ({ imageIds, examId, patientId }: AnalyzeParams) => {
      
      if (!imageIds || imageIds.length === 0) {
        throw new Error("No images available to analyze.");
      }

      // --- Logic: Strip Prefix & Select Middle 3 Slices ---
      const cleanUrls = imageIds.map(id => id.replace('wadouri:', ''));
      const total = cleanUrls.length;
      let selectedUrls: string[] = [];

      if (total <= 3) {
        selectedUrls = cleanUrls;
      } else {
        const midIndex = Math.floor(total / 2);
        selectedUrls = [
          cleanUrls[midIndex - 1], 
          cleanUrls[midIndex], 
          cleanUrls[midIndex + 1]
        ];
      }

      console.log(`Sending ${selectedUrls.length} slices for analysis...`);
      console.log(selectedUrls);
      // --- API Request ---
      const cleanBase = apiUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanBase}/api/cdss/analyze-dicom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          patientId,
          dicomUrls: selectedUrls 
        }),
      });

      const json: CDSSResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "AI Analysis failed");
      }

      return json.diagnosis;
    },
    onError: (err) => {
      console.error("CDSS Analysis Error:", err);
    }
  });

  // 3. Return a consistent API
  return {
    // Wrapper to match previous signature (args vs object)
    analyzeImages: (imageIds: string[], examId?: number | string, patientId?: number | string) => {
      mutation.mutate({ imageIds, examId, patientId });
    },
    isAnalyzing: mutation.isPending,
    cdssResult: mutation.data || null, // data is undefined initially
    error: mutation.error ? mutation.error.message : null,
    reset: mutation.reset
  };
};