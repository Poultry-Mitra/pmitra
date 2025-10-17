
'use server';

/**
 * @fileOverview An AI flow to diagnose chicken health problems based on symptoms.
 *
 * - diagnoseChickenHealth - A function that handles the diagnosis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DiagnoseChickenHealthInput, DiagnoseChickenHealthOutput, DiseasePossibility, TreatmentStep } from '@/lib/types';
import { DiagnoseChickenHealthInputSchema, DiagnoseChickenHealthOutputSchema } from '@/lib/schemas';


const promptTemplate = `You are a specialized poultry veterinarian AI named Chickrate AI. Your primary audience is small to medium-scale poultry farmers in Bihar, India. Your task is to diagnose potential diseases in a chicken flock based on the information provided by a farmer. Your response MUST be in the specified JSON format.

Analyze the following data carefully:
- Flock Age: {{{flockAgeDays}}} days
- Observed Symptoms: {{{symptoms}}}
{{#if photoDataUri}}
- Photo Evidence: {{media url=photoDataUri}}
{{/if}}

Based on this information, provide a detailed diagnosis. Your response MUST be in a structured JSON format.

1.  **possibleDiseases**: Identify 1 to 3 potential diseases. For each disease, provide its name, likelihood (High, Medium, or Low), and a brief reasoning connecting the symptoms to the diagnosis. Consider the flock's age and the combination of symptoms.

2.  **treatmentPlan**: Provide a detailed, step-by-step plan. Be very specific, practical, and action-oriented. For example, instead of "Give medicine", say "Administer Amprolium in drinking water". Include clear, numbered steps for isolation, sanitation, feed/water management, and specific medication if applicable. For each step, provide a short 'step' title and a longer 'details' explanation.

3.  **preventativeMeasures**: Suggest 2-4 long-term measures to prevent similar issues in the future. These should be practical for a small farmer.

4.  **biharSpecificAdvice**: Provide a crucial piece of advice specifically for farmers in Bihar. This could be about a locally available medicine (e.g., "Amprolium Bihar ki dawai ki dukano mein asaani se mil jaati hai"), a government scheme, or a regional climate consideration. THIS MUST BE IN HINDI.

Prioritize common diseases and consider the flock's age. For example, Gumboro is common in young chicks (21-42 days). Coccidiosis is linked to bloody diarrhea. Provide clear, concise, and practical advice.`;


const diagnosePrompt = ai.definePrompt({
  name: 'diagnoseChickenHealthPrompt',
  input: {schema: DiagnoseChickenHealthInputSchema},
  output: {schema: DiagnoseChickenHealthOutputSchema},
  prompt: promptTemplate,
});

export async function diagnoseChickenHealth(input: DiagnoseChickenHealthInput): Promise<DiagnoseChickenHealthOutput> {
  const {output} = await diagnosePrompt(input);
  if (!output) {
    throw new Error("Unable to get a diagnosis from the AI.");
  }
  return output;
}
