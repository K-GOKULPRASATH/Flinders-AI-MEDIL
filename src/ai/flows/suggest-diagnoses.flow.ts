// src/ai/flows/suggest-diagnoses.flow.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting diagnoses based on user input.
 *
 * - suggestDiagnoses - A function that suggests relevant diagnoses based on partial input.
 * - SuggestDiagnosesInput - The input type for the suggestDiagnoses function.
 * - SuggestDiagnosesOutput - The output type for the suggestDiagnoses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiagnosesInputSchema = z.object({
  partialDiagnosis: z
    .string()
    .describe('The partial diagnosis entered by the user.'),
});
export type SuggestDiagnosesInput = z.infer<typeof SuggestDiagnosesInputSchema>;

const SuggestDiagnosesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested diagnoses based on the input.'),
});
export type SuggestDiagnosesOutput = z.infer<typeof SuggestDiagnosesOutputSchema>;

export async function suggestDiagnoses(input: SuggestDiagnosesInput): Promise<SuggestDiagnosesOutput> {
  return suggestDiagnosesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiagnosesPrompt',
  input: {schema: SuggestDiagnosesInputSchema},
  output: {schema: SuggestDiagnosesOutputSchema},
  prompt: `You are a medical terminology expert. Suggest a list of diagnoses that are relevant to the user's partial input.

Partial Diagnosis: {{{partialDiagnosis}}}

Suggestions:`,
});

const suggestDiagnosesFlow = ai.defineFlow(
  {
    name: 'suggestDiagnosesFlow',
    inputSchema: SuggestDiagnosesInputSchema,
    outputSchema: SuggestDiagnosesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
