
'use server';

/**
 * @fileOverview An AI flow to diagnose chicken health problems based on symptoms.
 *
 * - diagnoseChickenHealth - A function that handles the diagnosis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseChickenHealthInputSchema = z.object({
  symptoms: z.string().describe('A comma-separated string of symptoms observed in the chicken(s), such as bloody diarrhea, ruffled feathers, paralysis, coughing, sneezing, etc.'),
  flockAgeWeeks: z.number().int().describe('The age of the flock in weeks.'),
  photoDataUri: z.string().optional().describe("A photo of the sick chicken or its droppings, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type DiagnoseChickenHealthInput = z.infer<typeof DiagnoseChickenHealthInputSchema>;


const DiseasePossibilitySchema = z.object({
    name: z.string().describe('The name of the possible disease (e.g., Coccidiosis, Marek\'s Disease).'),
    likelihood: z.enum(['High', 'Medium', 'Low']).describe('The likelihood of this disease being the cause.'),
    reasoning: z.string().describe('A brief explanation of why this disease is considered a possibility based on the provided symptoms and age.'),
});

const TreatmentStepSchema = z.object({
    step: z.string().describe("A single, clear, actionable step title (e.g., 'Isolate Sick Birds')."),
    details: z.string().describe("A more detailed explanation for the step, including why it's important and how to do it.")
});

const DiagnoseChickenHealthOutputSchema = z.object({
  possibleDiseases: z.array(DiseasePossibilitySchema).describe('A list of 1 to 3 possible diseases, ranked by likelihood.'),
  treatmentPlan: z.array(TreatmentStepSchema).describe("A step-by-step treatment and management plan. This should be very detailed and practical for a small-scale farmer."),
  preventativeMeasures: z.array(z.string()).describe('A list of 2-4 long-term preventative measures to avoid this issue in the future.'),
  biharSpecificAdvice: z.string().describe("Specific advice relevant to farmers in Bihar, India. Mention locally available medicine brands or government resources if applicable. THIS MUST BE IN HINDI."),
});
export type DiagnoseChickenHealthOutput = z.infer<typeof DiagnoseChickenHealthOutputSchema>;


const promptTemplate = `You are a specialized poultry veterinarian AI named Chickrate AI. Your primary audience is small to medium-scale poultry farmers in Bihar, India. Your task is to diagnose potential diseases in a chicken flock based on the information provided by a farmer. Your response MUST be in the specified JSON format.

Analyze the following data carefully:
- Flock Age: {{{flockAgeWeeks}}} weeks
- Observed Symptoms: {{{symptoms}}}
{{#if photoDataUri}}
- Photo Evidence: {{media url=photoDataUri}}
{{/if}}

Based on this information, provide a detailed diagnosis. Your response MUST be in a structured JSON format.

1.  **possibleDiseases**: Identify 1 to 3 potential diseases. For each disease, provide its name, likelihood (High, Medium, or Low), and a brief reasoning connecting the symptoms to the diagnosis. Consider the flock's age and the combination of symptoms.

2.  **treatmentPlan**: Provide a detailed, step-by-step plan. Be very specific, practical, and action-oriented. For example, instead of "Give medicine", say "Administer Amprolium in drinking water". Include clear, numbered steps for isolation, sanitation, feed/water management, and specific medication if applicable. For each step, provide a short 'step' title and a longer 'details' explanation.

3.  **preventativeMeasures**: Suggest 2-4 long-term measures to prevent similar issues in the future. These should be practical for a small farmer.

4.  **biharSpecificAdvice**: Provide a crucial piece of advice specifically for farmers in Bihar. This could be about a locally available medicine (e.g., "Amprolium Bihar ki dawai ki dukano mein asaani se mil jaati hai"), a government scheme, or a regional climate consideration. THIS MUST BE IN HINDI.

Prioritize common diseases and consider the flock's age. For example, Gumboro is common in young chicks. Coccidiosis is linked to bloody diarrhea. Provide clear, concise, and practical advice.`;


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
