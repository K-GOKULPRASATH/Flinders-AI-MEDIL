// src/ai/flows/suggest-recommendations.flow.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recommendations (lifestyle, diet, therapeutic) based on a traditional medical system diagnosis.
 *
 * - suggestRecommendations - A function that takes a diagnosis and medical system as input and returns AI-generated recommendations.
 * - SuggestRecommendationsInput - The input type for the suggestRecommendations function.
 * - SuggestRecommendationsOutput - The return type for the suggestRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecommendationsInputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis in the traditional medical system.'),
  medicalSystem: z.enum(['Ayurveda', 'Unani', 'Siddha', 'ICD']).describe('The traditional medical system the diagnosis belongs to.'),
});
export type SuggestRecommendationsInput = z.infer<typeof SuggestRecommendationsInputSchema>;

const SuggestRecommendationsOutputSchema = z.object({
  lifestyleRecommendations: z.string().describe('AI-generated lifestyle recommendations based on the diagnosis and medical system.'),
  dietaryRecommendations: z.string().describe('AI-generated dietary recommendations based on the diagnosis and medical system.'),
  therapeuticRecommendations: z.string().describe('AI-generated therapeutic recommendations based on the diagnosis and medical system.'),
});
export type SuggestRecommendationsOutput = z.infer<typeof SuggestRecommendationsOutputSchema>;

export async function suggestRecommendations(input: SuggestRecommendationsInput): Promise<SuggestRecommendationsOutput> {
  return suggestRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecommendationsPrompt',
  input: {schema: SuggestRecommendationsInputSchema},
  output: {schema: SuggestRecommendationsOutputSchema},
  prompt: `You are an expert in traditional medicine systems such as Ayurveda, Unani, and Siddha.
Given a diagnosis in a specific traditional medical system, provide detailed and practical recommendations in the following categories:

1.  Lifestyle: Suggest specific lifestyle adjustments that can help manage the condition.
2.  Diet: Recommend dietary changes, including foods to favor and foods to avoid.
3.  Therapeutic: Suggest therapeutic interventions or remedies commonly used in the specified traditional system.

Medical System: {{{medicalSystem}}}
Diagnosis: {{{diagnosis}}}

Ensure the recommendations are clear, actionable, and rooted in the principles of the given medical system. Focus on providing holistic advice that addresses the root causes and symptoms of the diagnosis.

Return the recommendations in separate fields, lifestyleRecommendations, dietaryRecommendations, and therapeuticRecommendations.
`,
});

const suggestRecommendationsFlow = ai.defineFlow(
  {
    name: 'suggestRecommendationsFlow',
    inputSchema: SuggestRecommendationsInputSchema,
    outputSchema: SuggestRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
