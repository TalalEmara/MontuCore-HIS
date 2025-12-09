import { useQuery } from '@tanstack/react-query';


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
  const token = localStorage.getItem('token');

  const response = await fetch(`http://localhost:3000/api/appointments/clinician/${clinicianId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
    enabled: !!clinicianId, // Only fetch if a valid ID is provided
    
    // Optional: Use 'select' if you want the hook to return ONLY the array
    select: (response) => response.data
  });
};