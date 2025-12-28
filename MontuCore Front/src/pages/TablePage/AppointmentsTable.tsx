import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import Button from "../../components/level-0/Button/Bottom";
import BasicOverlay from "../../components/level-0/Overlay/BasicOverlay";
import { Calendar, X } from "lucide-react";
import { useCancelAppointment, useRescheduleAppointment } from "../../hooks/useAppointments";
import { useAuth } from "../../context/AuthContext";

export default function AppointmentsTable() {
  const { user } = useAuth();
  const location = useLocation();
  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointment();

  const isAthleteView = location.pathname.includes("/athlete");
  const isClinicianView = location.pathname.includes("/physician") || location.pathname.includes("/physio");

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newDate, setNewDate] = useState<string>("");

  const appointments = [
    { id: 1, athlete: "Cristiano Ronaldo", clinician: "Dr. Olivia Black", date: "2024-01-10T10:00:00", status: "COMPLETED" },
    { id: 2, athlete: "Lionel Messi", clinician: "Dr. Olivia Black", date: "2026-02-15T14:30:00", status: "SCHEDULED" },
    { id: 3, athlete: "Cristiano Ronaldo", clinician: "Dr. Jones", date: "2026-03-20T09:00:00", status: "SCHEDULED" },
  ];

  const useTest = (page: number, size: number) => {
    return {
      data: appointments,
      isLoading: false,
      totalItems: appointments.length,
    };
  };

  const handleCancelAction = (appointmentId: number) => {
    if (window.confirm("Are you sure?")) {
      cancelMutation.mutate(appointmentId);
    }
  };

  const openRescheduleAction = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNewDate(""); 
    setIsRescheduleOpen(true);
  };

  const isFuture = (dateStr: string) => new Date(dateStr) > new Date();

  const allColumns = [
    { 
      header: "#", 
      cell: (row: any) => row.id 
    },
    { 
      header: "Athlete", 
      cell: (row: any) => <strong>{row.athlete}</strong> 
    },
    { 
      header: "Clinician", 
      cell: (row: any) => row.clinician 
    },
    { 
      header: "Date", 
      cell: (row: any) => new Date(row.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    },
    { 
      header: "Status", 
      cell: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge 
            label={row.status} 
            variant={row.status === "COMPLETED" ? "success" : row.status === "CANCELLED" ? "warning" : "pending"} 
          />
          {isFuture(row.date) && row.status !== "CANCELLED" && (
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" height="1.75rem" width="1.875rem" onClick={() => openRescheduleAction(row)}>
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

  const appointmentColumns = isClinicianView 
    ? allColumns.filter(col => col.header !== "Clinician") 
    : allColumns;

  return (
    <>
      <TablePage 
        title="Schedule Management" 
        useDataHook={useTest} 
        columns={appointmentColumns} 
      />

      <BasicOverlay isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} title="Reschedule Appointment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.625rem' }}>
          <p>
            Rescheduling appointment for <strong>{selectedAppointment?.athlete}</strong>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Select New Date & Time</label>
            <input 
              type="datetime-local" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="custom-date-input" 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
            <Button variant="secondary" onClick={() => setIsRescheduleOpen(false)} height="2.2rem">Cancel</Button>
            <Button variant="primary" onClick={() => setIsRescheduleOpen(false)} height="2.2rem">Confirm</Button>
          </div>
        </div>
      </BasicOverlay>
    </>
  );
}