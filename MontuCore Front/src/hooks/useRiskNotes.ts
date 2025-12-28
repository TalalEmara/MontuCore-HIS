import { useBookAppointment } from './useAppointments';
import { useAuth } from '../context/AuthContext';

export interface CreateRiskEntryData {
  athleteId: string;
  clinicianId: string;
  severity: string;
  categories: string[];
  notes: string;
}

export const useCreateRiskAppointment = () => {
  const { mutate: bookAppointment, isPending } = useBookAppointment();
  const { user } = useAuth(); // To get the author (logged-in user)

  const createRiskEntry = (
    data: CreateRiskEntryData, 
    onSuccess: () => void,
    onError: (err: any) => void
  ) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    // 1. Format the Diagnosis Notes String
    // Format: [3y{ROLE.ID}][@s:obsrv[Obs1, Obs2]][5tart] Notes...
    const observations = data.categories.join(", ");
    const authorTag = `[3y{${user.role}.${user.id}}]`;
    const obsTag = `[@s:obsrv[${observations}]]`;
    const startTag = `[5tart]`;
    
    const formattedDiagnosis = `${authorTag}${obsTag}${startTag} ${data.notes}`;

    // 2. Calculate Date (1 minute from now)
    const scheduledAt = new Date(Date.now() + 60 * 1000).toISOString();

    // 3. Payload Construction
    const payload = {
      athleteId: Number(data.athleteId),
      clinicianId: Number(data.clinicianId),
      scheduledAt: scheduledAt,
      status: "COMPLETED", // Already complete
      diagnosisNotes: formattedDiagnosis,
      height: 0,
      weight: 0 
    };

    // 4. Call existing API method
    bookAppointment(payload, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        onError(error);
      }
    });
  };

  return { createRiskEntry, isLoading: isPending };
};