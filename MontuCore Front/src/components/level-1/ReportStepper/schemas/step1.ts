import { z } from "zod";

export const step1Schema = z.object({
  caseStatus: z.enum(["active", "recovered"], {
    message: "Case status is required",
  }),

  Notes: z
    .string()
    .min(1, "Notes are required"),

  symptoms: z.array(z.string()).optional(),

  painLevel: z.coerce.number().min(1).max(10).optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;
