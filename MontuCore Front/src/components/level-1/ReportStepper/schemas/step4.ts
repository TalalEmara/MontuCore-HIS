import { z } from "zod";

export const treatmentItemSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, "Treatment type is required"),
  description: z.string(),
  providerName: z.string().min(1, "Provider name is required"),
  date: z.string().min(1, "Date is required"), 
  cost: z.coerce
    .number({ message: "Cost must be a number" })
    .min(0, "Cost cannot be negative"),
});

export const step4Schema = z.object({
  treatment: z.array(treatmentItemSchema).min(1, "At least one treatment is required"),
});

export type TreatmentData = z.infer<typeof treatmentItemSchema>;