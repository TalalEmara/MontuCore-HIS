import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// --- Interfaces ---
export interface Appointment {
  id: number;
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height: number;
  weight: number;
  status: string; 
  diagnosisNotes: string;
  athlete: { fullName: string; };
  clinician: { fullName: string; };
}

export interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
}

export interface AppointmentClinician { fullName: string; }
export interface AppointmentAthlete { fullName: string; }

export interface AthleteAppointment {
  id: number;
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height: number;
  weight: number;
  status: string;
  diagnosisNotes: string;
  clinician: AppointmentClinician;
  athlete: AppointmentAthlete;
}

export interface AthleteAppointmentsResponse {
  success: boolean;
  data: AthleteAppointment[];
}

export interface CreateAppointmentRequest {
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

// --- API Fetchers (Pure Functions) ---

const fetchClinicianAppointments = async (clinicianId: number, token: string): Promise<AppointmentsResponse> => {
  const response = await fetch(`http://localhost:3000/api/appointments/clinician/${clinicianId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch appointments');
  }
  return response.json();
};

const fetchAthleteAppointments = async (athleteId: number, token: string): Promise<AthleteAppointmentsResponse> => {
  const response = await fetch(`http://localhost:3000/api/appointments/athlete/${athleteId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch athlete appointments');
  }
  return response.json();
};

// Fixed: Token is now an argument, NOT fetched via hook inside here
const bookAppointmentApi = async (data: CreateAppointmentRequest, token: string): Promise<CreateAppointmentResponse> => {
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
    throw new Error(errorData.message || 'Failed to book appointment');
  }
  return response.json();
};

// --- Custom Hooks (Where useAuth belongs) ---

export const useClinicianAppointments = (clinicianId: number) => {
  const { token } = useAuth(); // Get token here
  return useQuery({
    queryKey: ['appointments', 'clinician', clinicianId],
    queryFn: () => fetchClinicianAppointments(clinicianId, token!),
    enabled: !!clinicianId && !!token,
    select: (response) => response.data
  });
};

export const useAthleteAppointments = (athleteId: number | undefined) => {
  const { token } = useAuth(); // Get token here
  return useQuery({
    queryKey: ['appointments', 'athlete', athleteId],
    queryFn: () => fetchAthleteAppointments(athleteId!, token!),
    enabled: !!athleteId && !!token,
    select: (response) => response.data,
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth(); // Get token here

  return useMutation({
    // Pass the token to the API function
    mutationFn: (data: CreateAppointmentRequest) => bookAppointmentApi(data, token!),
    onSuccess: (response) => {
      console.log(response.message);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Booking failed:', error);
    },
  });
};