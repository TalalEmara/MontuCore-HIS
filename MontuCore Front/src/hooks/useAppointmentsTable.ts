import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { Appointment } from '../types/models';

// --- Interfaces ---

export interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
  // Pagination is optional based on the provided JSON sample
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppointmentFilters {
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  clinicianId?: number;
  athleteId?: number;
  caseId?: number;
}

export interface CreateAppointmentRequest {
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height?: number;
  weight?: number;
  status?: string;
  diagnosisNotes?: string;
  caseId?: number;
}

export interface RescheduleAppointmentRequest {
  appointmentId: number;
  scheduledAt: string;
  diagnosisNotes?: string;
  height?: number;
  weight?: number;
}

// --- API Fetchers ---

const fetchAppointments = async (filters: AppointmentFilters, token: string): Promise<AppointmentsResponse> => {
  const queryParams = new URLSearchParams();
  // Fixed limit to 100 to simulate "No Pagination" as requested
  queryParams.append('limit', '100');
  queryParams.append('page', '1');

  if (filters.status) queryParams.append('status', filters.status);
  if (filters.clinicianId) queryParams.append('clinicianId', filters.clinicianId.toString());
  if (filters.athleteId) queryParams.append('athleteId', filters.athleteId.toString());
  if (filters.caseId) queryParams.append('caseId', filters.caseId.toString());

  const response = await fetch(`http://localhost:3000/api/appointments?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch appointments');
  return response.json();
};

const bookAppointmentApi = async (data: CreateAppointmentRequest, token: string) => {
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

// --- Custom Hooks ---

// 1. Generic Hook (Flexible for any filter)
export const useAppointments = (filters: AppointmentFilters = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'list', filters],
    queryFn: () => fetchAppointments(filters, token!),
    enabled: !!token,
  });
};

// 2. Specific Hook for Athletes (Returns Appointment[])
export const useAthleteAppointments = (athleteId: number | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'list', { athleteId }],
    queryFn: () => fetchAppointments({ athleteId }, token!),
    enabled: !!athleteId && !!token,
    select: (response) => response.data, // Selects the array directly
  });
};

// 3. Specific Hook for Clinicians (Returns Appointment[])
export const useClinicianAppointments = (clinicianId: number | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'list', { clinicianId }],
    queryFn: () => fetchAppointments({ clinicianId }, token!),
    enabled: !!clinicianId && !!token,
    select: (response) => response.data, // Selects the array directly
  });
};

// 4. Create Appointment
export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => bookAppointmentApi(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// 5. Cancel Appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:3000/api/appointments/update-appointment-status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: 'CANCELLED' }),
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] });
  });
};

// 6. Reschedule Appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (data: RescheduleAppointmentRequest) => {
      // Update the existing appointment with new scheduled time
      const updateRes = await fetch(`http://localhost:3000/api/appointments/update-appointment-details/${data.appointmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          scheduledAt: data.scheduledAt,
          diagnosisNotes: data.diagnosisNotes,
          height: data.height,
          weight: data.weight
        }),
      });
      if (!updateRes.ok) throw new Error('Failed to reschedule appointment');
      
      return updateRes.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
};