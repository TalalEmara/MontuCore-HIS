import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export interface PhysicianDashboardResult { dashboard: any; message: string; }

const fetchPhysicianDashboard = async (
  clinicianId: number, 
  page: number, 
  limit: number,
  token: string, 
  API_URL: string = `http://localhost:3000/api` 
): Promise<any> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/physician/dashboard/${clinicianId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch dashboard data');
  }
  return response.json();
};

export const usePhysicianDashboard = (
  clinicianId: number, 
  page: number = 1, 
  limit: number = 10
) => {
  const { token } = useAuth();
  
  const queryInfo = useQuery({
    queryKey: ['dashboard', 'physician', clinicianId, page, limit],
    queryFn: () => fetchPhysicianDashboard(clinicianId, page, limit, token!),
    enabled: !!clinicianId && !!token,
    placeholderData: keepPreviousData,
    select: (response): PhysicianDashboardResult => {
      const rawDashboard = response.data || {};
      const allAppointments = rawDashboard.todaysAppointments?.appointments || [];

      const regularAppointments: any[] = [];
      const physioRiskNotes: any[] = [];

      allAppointments.forEach((appt: any) => {
        const notes = appt.diagnosisNotes || "";
        
        // Regex to match the specific format: [3y{ROLE..NAME.ID}]
        // We look for 'Physiotherapist' (case-insensitive) in the Role section
        const roleRegex = /\[3y\{(.*?)\.\.(.*?)\.(.*?)\}\]/;
        const match = notes.match(roleRegex);
        const isPhysio = match && match[1].toLowerCase().includes("physiotherapist");

        if (isPhysio) {
            // Decode the Physio Note
            const obsRegex = /\[@s:obsrv\[(.*?)\]\]/;
            const obsMatch = notes.match(obsRegex);
            const observations = obsMatch ? obsMatch[1].trim() : "";

            // Extract content after [5tart]
            const startTag = "[5tart]";
            const startIndex = notes.indexOf(startTag);
            const detailedNote = startIndex > -1 
                ? notes.substring(startIndex + startTag.length).trim() 
                : "";

            // Logic: Use Observation if available, otherwise Detailed Note
            const finalNote = observations.length > 0 ? observations : detailedNote;

            if (finalNote) {
              physioRiskNotes.push({
                id: appt.id,
                athleteName: appt.athlete?.fullName || "Unknown Athlete",
                note: finalNote,
                originalDate: appt.scheduledAt
              });
            }
        } else {
            // Keep as a regular appointment if it's not a special Physio note
            regularAppointments.push(appt);
        }
      });

      // Construct the modified dashboard object
      const processedDashboard = {
        ...rawDashboard,
        todaysAppointments: {
          ...rawDashboard.todaysAppointments,
          appointments: regularAppointments
        },
        physioRiskNotes: physioRiskNotes // New field
      };

      return {
        dashboard: processedDashboard,
        message: response.message
      };
    },
  });

  return {
    ...queryInfo,
    dashboard: queryInfo.data?.dashboard,
    message: queryInfo.data?.message,
  };
};