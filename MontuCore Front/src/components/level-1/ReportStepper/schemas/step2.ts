import { z } from "zod";

export const step2Schema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  injuryType: z.string().optional(),
  rehabProgram: z.string().optional(), 
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "CRITICAL"]),
  followUpDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true; 
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, {
      message: "Follow-up date cannot be in the past",
    }),
});