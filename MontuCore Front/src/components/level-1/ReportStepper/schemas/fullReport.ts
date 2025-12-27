import { z } from "zod";
import { step1Schema } from "./step1";
import { step2Schema } from "./step2";
import { step3Schema } from "./step3";
import { step4Schema } from "./step4";

export const fullReportSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

export type FullReport = z.infer<typeof fullReportSchema>;
