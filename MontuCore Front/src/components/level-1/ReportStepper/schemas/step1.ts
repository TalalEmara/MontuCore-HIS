import { z } from "zod";

export const step1Schema = z.object({
  symptoms: z.array(z.string()).min(1, "Select at least one symptom"),
  additionalNotes: z.string().optional(),
  painLevel: z.coerce.number().min(1).max(10, "Pain level must be between 1 and 10")

});

export type Step2Data = z.infer<typeof step1Schema>;