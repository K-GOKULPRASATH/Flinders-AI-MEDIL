import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-diagnoses.flow.ts';
import '@/ai/flows/generate-condition-description-flow.ts';
import '@/ai/flows/suggest-icd-codes.flow.ts';
import '@/ai/flows/suggest-recommendations.flow.ts';