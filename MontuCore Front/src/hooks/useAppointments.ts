import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


export interface Appointment {
  id: number;
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height: number;
  weight: number;
  status: string; 
  diagnosisNotes: string;
  athlete: {
    fullName: string;
  };
  clinician: {
    fullName: string;
  };
}

export interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
}


const fetchClinicianAppointments = async (clinicianId: number): Promise<AppointmentsResponse> => {
  // Retrieve the token stored during login
  // const token = localStorage.getItem('token');
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzE0OTcxLCJleHAiOjE3NjY5NzQxNzF9.VxkUskovzCmRIyOwHfFlrF6RLb2k794pIgGf4VSJ7Z0";

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

export const useClinicianAppointments = (clinicianId: number) => {
  return useQuery({
    queryKey: ['appointments', 'clinician', clinicianId],
    queryFn: () => fetchClinicianAppointments(clinicianId),
    enabled: !!clinicianId,
    select: (response) => response.data
  });
};


export interface AppointmentClinician {
  fullName: string;
}

export interface AppointmentAthlete {
  fullName: string;
}

export interface AthleteAppointment {
  id: number;
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height: number;
  weight: number;
  status: string; // e.g. "COMPLETED", "SCHEDULED"
  diagnosisNotes: string;
  clinician: AppointmentClinician;
  athlete: AppointmentAthlete;
}

export interface AthleteAppointmentsResponse {
  success: boolean;
  data: AthleteAppointment[];
}


const fetchAthleteAppointments = async (athleteId: number): Promise<AthleteAppointmentsResponse> => {
  // const token = localStorage.getItem('token');
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzE0OTcxLCJleHAiOjE3NjY5NzQxNzF9.VxkUskovzCmRIyOwHfFlrF6RLb2k794pIgGf4VSJ7Z0";

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


export const useAthleteAppointments = (athleteId: number | undefined) => {
  return useQuery({
    queryKey: ['appointments', 'athlete', athleteId],
    queryFn: () => fetchAthleteAppointments(athleteId!),
    enabled: !!athleteId,
    select: (response) => response.data,
  });
};
// --- Booking Hook ---

export interface CreateAppointmentRequest {
  athleteId: number;
  clinicianId: number;
  scheduledAt: string; // ISO String
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

const bookAppointmentApi = async (data: CreateAppointmentRequest): Promise<CreateAppointmentResponse> => {
  // const token = localStorage.getItem('token');
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzE0OTcxLCJleHAiOjE3NjY5NzQxNzF9.VxkUskovzCmRIyOwHfFlrF6RLb2k794pIgGf4VSJ7Z0";
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
export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointmentApi,
    onSuccess: (response) => {
      console.log(response.message);
      
      // 3. This triggers a background refetch for any query starting with 'appointments'
      // This includes ['appointments', 'athlete', id] used in your view
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Booking failed:', error);
    },
  });
};