import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  API_URL: string = `http://localhost:3000/api`
): Promise<RegisterResponse> => {
  const token = localStorage.getItem('token'); // Restored token from storage
//   const token = localStorage.getItem('token'); // Hardcode for testing
  
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
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register clinician');
  }

  return response.json();
};

const registerAthleteChainApi = async (data: AthleteRegisterInput, adminId: number,  API_URL: string = `http://localhost:3000/api`) => {

//   const token = localStorage.getItem('token');
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzA0MTgyLCJleHAiOjE3NjY5NjMzODJ9.FvDW5zzDWD9G86F3E_DjTn8N6Hpf_nzjcp6ryp5jw1E";
  
//   Admin ID needed for appointment creation


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
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(registerPayload),
  });

  if (!regResponse.ok) {
    const errorData = await regResponse.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register athlete');
  }

  const regResult = await regResponse.json();
  
  
//   Athelete ID from registration NEEDED FOR APPOINTMENT
  const newAthleteId = 5;

  // ---  Create Appointment ---
  const appointmentPayload = {
    athleteId: newAthleteId,
    clinicianId: adminId, 
    scheduledAt: new Date(Date.now() + 60 * 1000).toISOString(),
    height: data.height,
    weight: data.weight,
    status: 'COMPLETED',
    diagnosisNotes: 'Initial Registration Intake'
  };

  // DEBUG: Log payload before sending
  console.log("DEBUG [Create Appointment] Payload:", JSON.stringify(appointmentPayload, null, 2));
  console.log("DEBUG [Create Appointment] Token used:", token);

  const apptResponse = await fetch(`${API_URL}/appointments/create-appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(appointmentPayload),
  });

  // If appointment fails, we just log it but don't crash because user is already registered
  if (!apptResponse.ok) {
    // DEBUG: Log failure details
    const errorText = await apptResponse.text();
    console.error("DEBUG [Create Appointment] FAILED");
    console.error("DEBUG [Create Appointment] Status:", apptResponse.status);
    console.error("DEBUG [Create Appointment] Response:", errorText);

    console.warn("User registered, but appointment creation failed.");
    return regResult;
  }

  const apptResult = await apptResponse.json();
  // DEBUG: Log success
  console.log("DEBUG [Create Appointment] SUCCESS. ID:", apptResult.data?.id);
  
  const newAppointmentId = apptResult.data.id;

  // ---  Create Case (If Injured) ---
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

    // DEBUG: Log case payload
    console.log("DEBUG [Create Case] Payload:", JSON.stringify(casePayload, null, 2));

    const caseResponse = await fetch(`${API_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(casePayload),
    });

    if (!caseResponse.ok) {
        // DEBUG: Log case failure
        const caseErrorText = await caseResponse.text();
        console.error("DEBUG [Create Case] FAILED");
        console.error("DEBUG [Create Case] Status:", caseResponse.status);
        console.error("DEBUG [Create Case] Response:", caseErrorText);
    } else {
        console.log("DEBUG [Create Case] SUCCESS");
    }
  }

  return regResult;
};

// --- Custom Hooks ---

export const useClinicianReg = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClinicianRegisterInput) => registerClinicianApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
  });
};

export const useAthleteReg = (adminId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AthleteRegisterInput) => registerAthleteChainApi(data, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};