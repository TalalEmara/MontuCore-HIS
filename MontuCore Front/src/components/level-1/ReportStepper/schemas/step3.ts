import { z } from "zod";

export const step3Schema = z
  .object({
    exam: z
      .array(
        z.object({
          modality: z.array(z.string()).optional(),
          bodyPart: z.string().optional(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.exam) {
      data.exam.forEach((item, index) => {
        if (item.modality && item.modality.length > 0) {
          if (!item.bodyPart || item.bodyPart.trim() === "") {
            ctx.addIssue({
              path: ["exam", index, "bodyPart"],
              message: "Body part is required when imaging modality is selected",
              code: z.ZodIssueCode.custom,
            });
          }
        }
      });
    }
  });
