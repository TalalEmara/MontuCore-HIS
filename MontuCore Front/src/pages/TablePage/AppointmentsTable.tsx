import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import Button from "../../components/level-0/Button/Bottom";
import BasicOverlay from "../../components/level-0/Overlay/BasicOverlay";
import { Calendar, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { 
  useClinicianAppointments, 
  useAthleteAppointments, 
  useCancelAppointment, 
  useRescheduleAppointment 
} from "../../hooks/useAppointments";

// [ADAPTER] Dynamically selects the correct hook based on User Role
const useAppointmentDataAdapter = (page: number, pageSize: number) => {
  const { user, profile } = useAuth();
  
  // Determine the ID to use: Profile ID is preferred (specific to Athlete/Clinician table), fallback to User ID
  const entityId = user?.id || user?.id || 0;

  const isClinician = user?.role === 'CLINICIAN';
  const isAthlete = user?.role === 'ATHLETE';

  // React Hooks must always be called. We control execution via the arguments (passing 0 disables the query).
  const clinicianQuery = useClinicianAppointments(isClinician ? entityId : 0, page, pageSize);
  const athleteQuery = useAthleteAppointments(isAthlete ? entityId : 0, page, pageSize);

  // Select the active query result based on role
  const { data, isLoading } = isClinician ? clinicianQuery : athleteQuery;

  return {
    // The hooks are configured to select 'response.data', so 'data' here is { appointments: [...], pagination: {...} }
    data: data?.appointments || [],
    isLoading,
    totalItems: data?.pagination?.total || 0,
  };
};

export default function AppointmentsTable() {
  const location = useLocation();
  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointment();

  // Determine view mode for column visibility
  const isClinicianView = location.pathname.includes("/physician") || location.pathname.includes("/physio");

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newDate, setNewDate] = useState<string>("");

  const handleCancelAction = (appointmentId: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(appointmentId);
    }
  };

  const handleRescheduleSubmit = () => {
    if (!newDate || !selectedAppointment) return;
    
    rescheduleMutation.mutate({
      appointmentId: selectedAppointment.id,
      scheduledAt: new Date(newDate).toISOString()
    }, {
      onSuccess: () => {
        setIsRescheduleOpen(false);
        setNewDate("");
      }
    });
  };

  const columns = [
    { header: "#", cell: (row: any) => row.id },
    { header: "Athlete", cell: (row: any) => <strong>{row.athlete?.fullName}</strong> },
    { header: "Clinician", cell: (row: any) => row.clinician?.fullName },
    { header: "Date", cell: (row: any) => new Date(row.scheduledAt).toLocaleString() },
    { 
      header: "Status", 
      cell: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge 
            label={row.status} 
            variant={row.status === "COMPLETED" ? "success" : row.status === "CANCELLED" ? "warning" : "pending"} 
          />
          {/* Only show actions for future appointments that aren't already cancelled */}
          {(() => {
            const isFuture = new Date(row.scheduledAt) > new Date();
            const isNotCancelled = row.status !== "CANCELLED";
            console.log('Appointment:', row.id, 'scheduledAt:', row.scheduledAt, 'isFuture:', isFuture, 'status:', row.status, 'isNotCancelled:', isNotCancelled);
            return isFuture && isNotCancelled && (
              <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" height="1.75rem" width="1.875rem" onClick={() => {
                  setSelectedAppointment(row);
                  setIsRescheduleOpen(true);
                }}>
                  <Calendar size={14} />
                </Button>
                <Button variant="secondary" height="1.75rem" width="1.875rem" onClick={() => handleCancelAction(row.id)}>
                  <X size={14} />
                </Button>
              </div>
            );
          })()}
        </div>
      ) 
    },
  ];

  return (
    <>
      <TablePage 
        title="Schedule Management" 
        useDataHook={useAppointmentDataAdapter} 
        // Hides Clinician column if the user is viewing as a clinician to reduce redundancy
        columns={isClinicianView ? columns.filter(c => c.header !== "Clinician") : columns} 
      />

      <BasicOverlay isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} title="Reschedule">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <p>Select a new date for <strong>{selectedAppointment?.athlete?.fullName}</strong></p>
          <input 
            type="datetime-local" 
            value={newDate} 
            onChange={(e) => setNewDate(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsRescheduleOpen(false)}>Back</Button>
            <Button 
                variant="primary" 
                onClick={handleRescheduleSubmit}
                disabled={rescheduleMutation.isPending || !newDate}
            >
              {rescheduleMutation.isPending ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </div>
      </BasicOverlay>
    </>
  );
}