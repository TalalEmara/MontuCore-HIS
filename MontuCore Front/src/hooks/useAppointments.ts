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
  height?: number;
  weight?: number;
  status?: string; 
  diagnosisNotes?: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

// Updated Interface for Reschedule to include data needed for the new booking
export interface RescheduleAppointmentRequest {
  appointmentId: number; // ID of the appointment to cancel
  athleteId: number;     // ID for the new appointment
  clinicianId: number;   // ID for the new appointment
  scheduledAt: string;   // New time
  diagnosisNotes?: string;
  height?: number;
  weight?: number;
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

export const bookAppointmentApi = async (data: CreateAppointmentRequest, token: string): Promise<CreateAppointmentResponse> => {
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

// [NEW] API Call for Canceling (uses update status)
export const cancelAppointmentApi = async (appointmentId: number, token: string): Promise<any> => {
  const response = await fetch('http://localhost:3000/api/appointments/update-appointment-status/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      id: appointmentId, 
      status: 'CANCELLED' 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to cancel appointment');
  }
  return response.json();
};

// [NEW] API Call for Rescheduling (Cancel Old -> Book New)
export const rescheduleAppointmentApi = async (data: RescheduleAppointmentRequest, token: string): Promise<CreateAppointmentResponse> => {
  // 1. Cancel the existing appointment
  await cancelAppointmentApi(data.appointmentId, token);

  // 2. Create the new appointment with the same IDs
  const newData: CreateAppointmentRequest = {
    athleteId: data.athleteId,
    clinicianId: data.clinicianId,
    scheduledAt: data.scheduledAt,
    diagnosisNotes: data.diagnosisNotes,
    height: data.height,
    weight: data.weight,
    status: 'SCHEDULED' // Ensure the new one is scheduled
  };

  return bookAppointmentApi(newData, token);
};

// --- Custom Hooks ---

export const useClinicianAppointments = (clinicianId: number) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'clinician', clinicianId],
    queryFn: () => fetchClinicianAppointments(clinicianId, token!),
    enabled: !!clinicianId && !!token,
    select: (response) => response.data
  });
};

export const useAthleteAppointments = (athleteId: number | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'athlete', athleteId],
    queryFn: () => fetchAthleteAppointments(athleteId!, token!),
    enabled: !!athleteId && !!token,
    select: (response) => response.data,
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
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

// [NEW] Hook for Rescheduling
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: RescheduleAppointmentRequest) => rescheduleAppointmentApi(data, token!),
    onSuccess: (response) => {
      console.log('Reschedule successful: Old cancelled, New created.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Reschedule failed:', error);
    },
  });
};

// [NEW] Hook for Canceling
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (appointmentId: number) => cancelAppointmentApi(appointmentId, token!),
    onSuccess: (response) => {
      console.log('Cancellation successful');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Cancellation failed:', error);
    },
  });
};