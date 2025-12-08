import { z } from "zod";

export const step2Schema = z.object({
  diagnosis: z.string().min(3, "Diagnosis is required"),
  injuryType: z.string().min(1, "Injury type is required"),
  severity: z.enum(["mild", "moderate", "severe"]).default("mild"),
  recommendedImaging: z.array(z.string()).optional(),
});

export type Step3Data = z.infer<typeof step2Schema>;