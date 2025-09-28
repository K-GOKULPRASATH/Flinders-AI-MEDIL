'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting ICD-11 MMS and TM2 codes
 *  based on a given diagnosis.
 *
 * - suggestIcdCodes - A function that suggests ICD-11 codes for a given diagnosis.
 * - SuggestIcdCodesInput - The input type for the suggestIcdCodes function.
 * - SuggestIcdCodesOutput - The return type for the suggestIcdCodes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIcdCodesInputSchema = z.object({
  medicalSystem: z.string().describe('The medical system the diagnosis belongs to (e.g., Ayurveda, Unani, Siddha, or ICD itself).'),
  diagnosis: z.string().describe('The diagnosis to map to ICD-11 codes.'),
  patientId: z.string().describe('The ID of the patient.'),
});
export type SuggestIcdCodesInput = z.infer<typeof SuggestIcdCodesInputSchema>;

const SuggestIcdCodesOutputSchema = z.object({
  originalDiagnosis: z.string().describe('The original diagnosis provided by the user.'),
  mmsCode: z.string().describe('The suggested ICD-11 MMS code.'),
  mmsDescription: z.string().describe('The description of the MMS code (ICD Name).'),
  tm2Code: z.string().describe('The suggested ICD-11 TM2 code.'),
  tm2Description: z.string().describe('The description of the TM2 code (TM2 Name).'),
  conditionDescriptionEarlyStage: z.string().describe('AI-generated description of the condition in its early stages.'),
  conditionDescriptionIntermediateStage: z.string().describe('AI-generated description of the condition in its intermediate stages.'),
  conditionDescriptionAdvancedStage: z.string().describe('AI-generated description of the condition in its advanced stages.'),
  lifestyleRecommendations: z.string().describe('AI-generated lifestyle recommendations based on the traditional system.'),
  dietaryRecommendations: z.string().describe('AI-generated dietary recommendations based on the traditional system.'),
  therapeuticRecommendations: z.string().describe('AI-generated therapeutic recommendations based on the traditional system.'),
});
export type SuggestIcdCodesOutput = z.infer<typeof SuggestIcdCodesOutputSchema>;

export async function suggestIcdCodes(input: SuggestIcdCodesInput): Promise<SuggestIcdCodesOutput> {
  return suggestIcdCodesFlow(input);
}

const suggestIcdCodesPrompt = ai.definePrompt({
  name: 'suggestIcdCodesPrompt',
  input: {schema: SuggestIcdCodesInputSchema},
  output: {schema: SuggestIcdCodesOutputSchema},
  prompt: `You are an assistant specialized in mapping traditional medicine diagnoses to ICD-11 codes.
  Given a diagnosis in a specific medical system, you will provide the most accurate ICD-11 MMS and TM2 codes, along with descriptions and recommendations.

  Medical System: {{{medicalSystem}}}
  Diagnosis: {{{diagnosis}}}
  Patient ID: {{{patientId}}}

  Analyze the diagnosis and provide the following:
  - The original diagnosis in the 'originalDiagnosis' field.
  - The most accurate ICD-11 MMS code (for modern biomedicine) in the 'mmsCode' field.
  - The official description of the MMS code (ICD Name) in the 'mmsDescription' field.
  - The corresponding ICD-11 TM2 code (for traditional medicine) in the 'tm2Code' field.
  - The official description of the TM2 code (TM2 Name) in the 'tm2Description' field.
  - A detailed description of the condition, broken down by stages (Early, Intermediate, Advanced) in 'conditionDescriptionEarlyStage', 'conditionDescriptionIntermediateStage', and 'conditionDescriptionAdvancedStage' fields.
  - A structured set of recommendations, including lifestyle in 'lifestyleRecommendations', diet in 'dietaryRecommendations', and therapeutic suggestions in 'therapeuticRecommendations', based on the traditional system.
  `,
});

const suggestIcdCodesFlow = ai.defineFlow(
  {
    name: 'suggestIcdCodesFlow',
    inputSchema: SuggestIcdCodesInputSchema,
    outputSchema: SuggestIcdCodesOutputSchema,
  },
  async input => {
    const {output} = await suggestIcdCodesPrompt(input);
    if (output) {
      output.originalDiagnosis = input.diagnosis;
    }
    return output!;
  }
);
