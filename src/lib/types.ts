import type { suggestIcdCodes } from "@/ai/flows/suggest-icd-codes.flow";
import type { z } from "zod";
import type { diagnosisFormSchema } from "@/components/dashboard/diagnosis-form";

export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

export type IcdCodeResults = Awaited<ReturnType<typeof suggestIcdCodes>>;
