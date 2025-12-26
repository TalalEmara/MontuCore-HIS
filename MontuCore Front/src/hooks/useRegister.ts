import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// --- 1. Interfaces ---

export interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface BaseRegisterData {
  email: string;
  password: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dob: string; // ISO Date String
}

export interface ClinicianRegisterInput extends BaseRegisterData {
  specialty: string;
}

export interface AthleteRegisterInput extends BaseRegisterData {
  position: string;
  jerseyNumber: number;
  height: number;
  weight: number;
  status: 'fit' | 'injured';
}


// --- API Fetchers ---

const registerClinicianApi = async (
  data: ClinicianRegisterInput,
  token: string, // <--- Token is now required
  API_URL: string = `http://localhost:3000/api`
): Promise<RegisterResponse> => {
  
  const payload = {
    generalData: {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: 'CLINICIAN',
      gender: data.gender,
      dob: data.dob,
    },
    userData: {
      specialty: data.specialty,
    },
  };

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // <--- Auth Header Added
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register clinician');
  }

  return response.json();
};

const registerAthleteChainApi = async (
  data: AthleteRegisterInput, 
  adminId: number,  
  token: string, // <--- Token is now required
  API_URL: string = `http://localhost:3000/api`
) => {

  // --- STEP 1: Register User ---
  const registerPayload = {
    generalData: {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: 'ATHLETE',
      gender: data.gender,
      dob: data.dob,
    },
    userData: {
      position: data.position,
      jerseyNumber: data.jerseyNumber,
    },
  };

  const regResponse = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // <--- Auth Header Added
    },
    body: JSON.stringify(registerPayload),
  });

  if (!regResponse.ok) {
    const errorData = await regResponse.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register athlete');
  }

  const regResult = await regResponse.json();
  
  // Use the ID returned from the registration response
  const newAthleteId = regResult.user?.id; 

  if (!newAthleteId) {
      console.warn("User registered, but ID not found in response. Skipping appointment creation.");
      return regResult;
  }

  // --- STEP 2: Create Appointment ---
  const appointmentPayload = {
    athleteId: newAthleteId,
    clinicianId: adminId, 
    scheduledAt: new Date(Date.now() + 60 * 1000).toISOString(),
    height: data.height,
    weight: data.weight,
    status: 'COMPLETED',
    diagnosisNotes: 'Initial Registration Intake'
  };

  const apptResponse = await fetch(`${API_URL}/appointments/create-appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // <--- Auth Header Added
    },
    body: JSON.stringify(appointmentPayload),
  });

  // If appointment fails, we just log it but don't crash because user is already registered
  if (!apptResponse.ok) {
    const errorText = await apptResponse.text();
    console.error("DEBUG [Create Appointment] FAILED", errorText);
    console.warn("User registered, but appointment creation failed.");
    return regResult;
  }

  const apptResult = await apptResponse.json();
  const newAppointmentId = apptResult.data.id;

  // --- STEP 3: Create Case (If Injured) ---
  if (data.status === 'injured') {
    const casePayload = {
      athleteId: newAthleteId,
      managingClinicianId: adminId,
      initialAppointmentId: newAppointmentId,
      diagnosisName: 'Initial Injury Assessment',
      icd10Code: 'N/A',
      injuryDate: new Date().toISOString(),
      status: 'ACTIVE',
      severity: 'MILD',
      medicalGrade: 'Pending'
    };

    const caseResponse = await fetch(`${API_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // <--- Auth Header Added
      },
      body: JSON.stringify(casePayload),
    });

    if (!caseResponse.ok) {
        const caseErrorText = await caseResponse.text();
        console.error("DEBUG [Create Case] FAILED", caseErrorText);
    } else {
        console.log("DEBUG [Create Case] SUCCESS");
    }
  }

  return regResult;
};

// --- Custom Hooks ---

export const useClinicianReg = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth(); // <--- Get Token from Context

  return useMutation({
    mutationFn: (data: ClinicianRegisterInput) => {
        if (!token) throw new Error("Authentication required to register clinicians");
        return registerClinicianApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
  });
};

export const useAthleteReg = (adminId: number) => {
  const queryClient = useQueryClient();
  const { token } = useAuth(); // <--- Get Token from Context

  return useMutation({
    mutationFn: (data: AthleteRegisterInput) => {
        if (!token) throw new Error("Authentication required to register athletes");
        return registerAthleteChainApi(data, adminId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};