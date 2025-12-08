import { step1Schema } from "./step1";
import { step2Schema } from "./step2";
import { step3Schema } from "./step3";
import { z } from "zod";

export const fullReportSchema = step1Schema
  .merge(step1Schema)
  .merge(step2Schema)
  .merge(step3Schema);

export type FullReport = z.infer<typeof fullReportSchema>;
