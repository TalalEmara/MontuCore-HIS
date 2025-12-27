import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct

export interface ConsultationRequest {
  athleteId: number;
  permissions: {
    caseIds: number[];
    examIds: number[];
    labIds: number[];
    notes: string;
  };
  expiryHours: number;
}

export interface ConsultationResponse {
  success: boolean;
  message: string;
  data: {
    shareToken: string;
    accessCode: string;
    fullLink: string;
    expiresAt: string;
  };
}

export interface ExternalViewResponse {
  success: boolean;
  data: {
    meta: {
      sharedBy: string;
      patientName: string;
      expiresAt: string;
      notes: string;
    };
    data: {
      cases: any[];
      exams: any[];
      labs: any[];
    };
  };
}

const API_URL = `http://localhost:3000/api`;

// --- API Fetchers ---
const generateConsultationLinkApi = async (payload: ConsultationRequest, token: string): Promise<ConsultationResponse> => {
  const response = await fetch(`${API_URL}/consults/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 403) throw new Error("403 Forbidden: Insufficient permissions.");
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate consultation link');
  }
  return response.json();
};

const fetchExternalConsultationApi = async (shareToken: string, accessCode: string): Promise<ExternalViewResponse> => {
  const response = await fetch(`${API_URL}/consults/view/${shareToken}?accessCode=${accessCode}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invalid Access Code or Link Expired');
  }
  return response.json();
};


export const useGenerateShareLink = () => {
  const { token } = useAuth(); 

  return useMutation({ 
    mutationFn: (payload: ConsultationRequest) => generateConsultationLinkApi(payload, token!) 
  });
};

export const useExternalConsultation = (shareToken: string, accessCode: string, enabled: boolean) => {

  return useQuery({
    queryKey: ['external-consultation', shareToken, accessCode],
    queryFn: () => fetchExternalConsultationApi(shareToken, accessCode),
    enabled: enabled && !!shareToken && !!accessCode,
    retry: false,
  });
};