import { z } from "zod";

export const step3Schema = z.object({
  immediateActions: z.string().min(5, "Immediate actions are required"),
  medication: z.string().optional(),
  rehabPlan: z.string().min(5, "Rehab plan is required"),
  followUpDate: z.string().min(1, "Follow-up date is required"),
});

export type Step4Data = z.infer<typeof step3Schema>;