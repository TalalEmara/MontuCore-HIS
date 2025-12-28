import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { Appointment, UserStub } from '../types/models';

// --- Interfaces ---

export interface PaginatedAppointmentsResponse {
  success: boolean;
  data: Appointment[];
  pagination: {
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

export interface RescheduleAppointmentRequest {
  appointmentId: number;
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
}

// --- API Fetcher ---

const fetchAppointments = async (filters: AppointmentFilters, token: string): Promise<PaginatedAppointmentsResponse> => {
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

// --- Custom Hooks ---

export const useAppointments = (filters: AppointmentFilters = {}) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'list', filters],
    queryFn: () => fetchAppointments(filters, token!),
    enabled: !!token,
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: number) => {
      await fetch(`http://localhost:3000/api/appointments/update-appointment-status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: 'CANCELLED' }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (data: RescheduleAppointmentRequest) => {
      // 1. Cancel existing
      await fetch(`http://localhost:3000/api/appointments/update-appointment-status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: data.appointmentId, status: 'CANCELLED' }),
      });
      // 2. Book new
      await fetch('http://localhost:3000/api/appointments/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          athleteId: data.athleteId,
          clinicianId: data.clinicianId,
          scheduledAt: data.scheduledAt,
          status: 'SCHEDULED'
        }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
};