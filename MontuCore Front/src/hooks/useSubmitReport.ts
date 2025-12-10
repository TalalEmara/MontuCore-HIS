import { useMutation, useQueryClient } from '@tanstack/react-query';

// 1. New Interface: Matches the Backend "Create Appointment" DTO
// You will need to map your form data to this structure in ReportStepper.tsx
export interface SubmitReportRequest {
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;    // ISO Date String
  diagnosisNotes: string; // The formatted report text goes here
  status?: string;        // Optional, e.g., "COMPLETED"
}

export interface SubmitReportResponse {
  success: boolean;
  message: string;
  data: any;
}

// 2. API Call: Hits the Appointment Endpoint directly
const submitReportApi = async (data: SubmitReportRequest): Promise<SubmitReportResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/appointments/create-appointment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit report');
  }

  return response.json();
};

// 3. The Hook
export const useSubmitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReportApi,
    onSuccess: (response) => {
      console.log("Report Submitted (Appointment Created):", response.message);
      
      // Refresh Appointments List
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Report submission failed:', error);
    },
  });
};