'use server';
/**
 * @fileOverview This file defines the AI flow for suggesting ICD-11 MMS and TM2 codes
 *  based on a given diagnosis, powered by OpenAI GPT-4o.
 *
 * - suggestIcdCodes - A function that suggests ICD-11 codes for a given diagnosis.
 * - SuggestIcdCodesInput - The input type for the suggestIcdCodes function.
 * - SuggestIcdCodesOutput - The return type for the suggestIcdCodes function.
 */

import { openai } from '@/ai/anthropic';
import { z } from 'zod';

const SuggestIcdCodesInputSchema = z.object({
  medicalSystem: z.string().describe('The medical system the diagnosis belongs to (e.g., Ayurveda, Unani, Siddha, or ICD itself).'),
  diagnosis: z.string().describe('The diagnosis to map to ICD-11 codes.'),
  patientId: z.string().describe('The ID of the patient.'),
});
export type SuggestIcdCodesInput = z.infer<typeof SuggestIcdCodesInputSchema>;

const SuggestIcdCodesOutputSchema = z.object({
  originalDiagnosis: z.string(),
  mmsCode: z.string(),
  mmsDescription: z.string(),
  tm2Code: z.string(),
  tm2Description: z.string(),
  conditionDescriptionEarlyStage: z.string(),
  conditionDescriptionIntermediateStage: z.string(),
  conditionDescriptionAdvancedStage: z.string(),
  lifestyleRecommendations: z.string(),
  dietaryRecommendations: z.string(),
  therapeuticRecommendations: z.string(),
});
export type SuggestIcdCodesOutput = z.infer<typeof SuggestIcdCodesOutputSchema>;

export async function suggestIcdCodes(input: SuggestIcdCodesInput): Promise<SuggestIcdCodesOutput> {
  const systemPrompt = `You are an assistant specialized in mapping traditional medicine diagnoses to ICD-11 codes.
Given a diagnosis in a specific medical system, you will provide the most accurate ICD-11 MMS and TM2 codes, along with descriptions and recommendations.

You MUST respond with ONLY valid JSON (no markdown, no code fences, no extra text) containing exactly these fields:
- "originalDiagnosis": The original diagnosis provided
- "mmsCode": The most accurate ICD-11 MMS code (for modern biomedicine)
- "mmsDescription": The official description of the MMS code (ICD Name)
- "tm2Code": The corresponding ICD-11 TM2 code (for traditional medicine)
- "tm2Description": The official description of the TM2 code (TM2 Name)
- "conditionDescriptionEarlyStage": A detailed description of the condition in its early stages
- "conditionDescriptionIntermediateStage": A detailed description of the condition in its intermediate stages
- "conditionDescriptionAdvancedStage": A detailed description of the condition in its advanced stages
- "lifestyleRecommendations": Lifestyle recommendations based on the traditional system
- "dietaryRecommendations": Dietary recommendations based on the traditional system
- "therapeuticRecommendations": Therapeutic recommendations based on the traditional system`;

  const userPrompt = `Medical System: ${input.medicalSystem}
Diagnosis: ${input.diagnosis}

Respond with ONLY valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response received from OpenAI.');
  }

  const parsed = JSON.parse(content);

  // Override originalDiagnosis with the actual input
  parsed.originalDiagnosis = input.diagnosis;

  // Validate with Zod
  const result = SuggestIcdCodesOutputSchema.parse(parsed);
  return result;
}
