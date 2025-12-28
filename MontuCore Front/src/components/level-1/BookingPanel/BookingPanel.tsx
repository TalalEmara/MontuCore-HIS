import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./BookingPanel.module.css";

// Level-0 Components
import Button from "../../level-0/Button/Bottom";
import TextInput from "../../level-0/TextInput/TextInput";
import ComboBox from "../../level-0/ComboBox/ComboBox";

// Hook
import { useBookAppointment } from "../../../hooks/useAppointments";
import { useAllClinicians, useUsersByRole } from "../../../hooks/useUsers";

// --- Schema Validation ---
const bookingSchema = z.object({
  clinicianId: z.string().min(1, "Please select a clinician"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: number; // Passed from parent (Context or Prop)
}


export default function BookingPanel({ isOpen, onClose, athleteId }: BookingPanelProps) {
  const { mutate: bookAppointment, isPending, isSuccess, error } = useBookAppointment();
  const { data: users } = useAllClinicians();
  const [successMsg, setSuccessMsg] = useState("");

  const { control, handleSubmit, formState: { errors }, reset } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clinicianId: "",
      date: "",
      time: "",
    }
  });

  
const CLINICIANS = users
  ? users.map((clinician) => ({
      label: clinician.fullName,
      value: clinician.id,
    }))
  : [];

  const onSubmit = (data: BookingFormData) => {
    // Combine Date and Time into ISO string
    const scheduledAt = new Date(`${data.date}T${data.time}:00`).toISOString();

    bookAppointment(
      {
        athleteId: Number(athleteId),
        clinicianId: Number(data.clinicianId),
        scheduledAt: scheduledAt,
      },
      {
        onSuccess: (res) => {
          setSuccessMsg("Appointment booked successfully!");
          setTimeout(() => {
            reset();
            setSuccessMsg("");
            onClose();
          }, 1500);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Book Appointment</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {isSuccess && successMsg ? (
          <div className={styles.successMsg}>{successMsg}</div>
        ) : (
          <form className={styles.formContent} onSubmit={handleSubmit(onSubmit)}>
            
            {/* Clinician Selector */}
            <Controller
              name="clinicianId"
              control={control}
              render={({ field }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <ComboBox
                    label="Clinician"
                    options={CLINICIANS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors.clinicianId && (
                    <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>
                      {errors.clinicianId.message}
                    </span>
                  )}
                </div>
              )}
            />

            {/* Date Input */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Date"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                />
              )}
            />

            {/* Time Input */}
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Time"
                  type="time"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.time?.message}
                />
              )}
            />

            {/* Backend Error Message */}
            {error && (
              <span className={styles.errorMsg}>
                {error.message || "Failed to book appointment. Please try again."}
              </span>
            )}

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}