'use server';

/**
 * @fileOverview Generates a detailed description of a medical condition by stages (Early, Intermediate, Advanced).
 *
 * - generateConditionDescription - A function that generates the condition description.
 * - GenerateConditionDescriptionInput - The input type for the generateConditionDescription function.
 * - GenerateConditionDescriptionOutput - The return type for the generateConditionDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConditionDescriptionInputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis to describe.'),
  medicalSystem: z.string().describe('The medical system the diagnosis belongs to (e.g., Ayurveda, Unani, Siddha, or ICD itself).'),
});
export type GenerateConditionDescriptionInput = z.infer<typeof GenerateConditionDescriptionInputSchema>;

const GenerateConditionDescriptionOutputSchema = z.object({
  description: z.object({
    earlyStage: z.string().describe('Description of the condition in its early stage.'),
    intermediateStage: z.string().describe('Description of the condition in its intermediate stage.'),
    advancedStage: z.string().describe('Description of the condition in its advanced stage.'),
  }).describe('Detailed description of the condition by stages.'),
});
export type GenerateConditionDescriptionOutput = z.infer<typeof GenerateConditionDescriptionOutputSchema>;

export async function generateConditionDescription(input: GenerateConditionDescriptionInput): Promise<GenerateConditionDescriptionOutput> {
  return generateConditionDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConditionDescriptionPrompt',
  input: {schema: GenerateConditionDescriptionInputSchema},
  output: {schema: GenerateConditionDescriptionOutputSchema},
  prompt: `You are an expert medical professional with deep knowledge of both modern and traditional medicine.

You are tasked with providing a detailed description of a medical condition, broken down by its stages: Early, Intermediate, and Advanced.

Consider the diagnosis and the medical system it originates from to provide a comprehensive and accurate description for each stage.

Diagnosis: {{{diagnosis}}}
Medical System: {{{medicalSystem}}}

Description:
`, // Note: Added colon at the end
});

const generateConditionDescriptionFlow = ai.defineFlow(
  {
    name: 'generateConditionDescriptionFlow',
    inputSchema: GenerateConditionDescriptionInputSchema,
    outputSchema: GenerateConditionDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
