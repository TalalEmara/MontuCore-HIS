import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import Button from "../../components/level-0/Button/Bottom";
import BasicOverlay from "../../components/level-0/Overlay/BasicOverlay";
import { Calendar, X } from "lucide-react";
import { useAppointments, useCancelAppointment, useRescheduleAppointment } from "../../hooks/useAppointmentsTable";

// [ADAPTER] Matches your pattern: Ignores pagination inputs, returns full dataset
const useAppointmentDataAdapter = () => {
  const { data: apiResponse, isLoading } = useAppointments(); 

  return {
    data: apiResponse?.data || [],
    isLoading,
    // totalItems matches data length to inform TablePage there's only 1 page
    totalItems: apiResponse?.data?.length || 0, 
  };
};

export default function AppointmentsTable() {
  const location = useLocation();
  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointment();

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
      athleteId: selectedAppointment.athleteId,
      clinicianId: selectedAppointment.clinicianId,
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
          {new Date(row.scheduledAt) > new Date() && row.status !== "CANCELLED" && (
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
          )}
        </div>
      ) 
    },
  ];

  return (
    <>
      <TablePage 
        title="Schedule Management" 
        useDataHook={useAppointmentDataAdapter} 
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