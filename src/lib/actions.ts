"use server";

import { suggestIcdCodes } from "@/ai/flows/suggest-icd-codes.flow";
import type { DiagnosisFormValues } from "./types";

export async function getIcdCodes(data: DiagnosisFormValues) {
  try {
    const result = await suggestIcdCodes({
      patientId: data.patientId,
      medicalSystem: data.medicalSystem,
      diagnosis: data.diagnosis,
    });
    return result;
  } catch (error) {
    console.error("Error getting ICD codes:", error);
    throw new Error("Failed to retrieve ICD code suggestions. Please try again.");
  }
}
