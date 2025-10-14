
'use server';

/**
 * @fileOverview An AI flow to diagnose chicken health problems based on symptoms.
 *
 * - diagnoseChickenHealth - A function that handles the diagnosis process.
 * - DiagnoseChickenHealthInput - The input type for the diagnoseChickenHealth function.
 * - DiagnoseChickenHealthOutput - The return type for the diagnoseChickenHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseChickenHealthInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the symptoms observed in the chicken(s), such as bloody diarrhea, ruffled feathers, paralysis, coughing, sneezing, etc.'),
  flockAgeWeeks: z.number().int().describe('The age of the flock in weeks.'),
  photoDataUri: z.string().optional().describe("A photo of the sick chicken or its droppings, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type DiagnoseChickenHealthInput = z.infer<typeof DiagnoseChickenHealthInputSchema>;

const DiseasePossibilitySchema = z.object({
    name: z.string().describe('The name of the possible disease (e.g., Coccidiosis, Marek\'s Disease).'),
    likelihood: z.enum(['High', 'Medium', 'Low']).describe('The likelihood of this disease being the cause.'),
    reasoning: z.string().describe('A brief explanation of why this disease is considered a possibility based on the provided symptoms and age.'),
});

const DiagnoseChickenHealthOutputSchema = z.object({
  possibleDiseases: z.array(DiseasePossibilitySchema).describe('A list of possible diseases, ranked by likelihood.'),
  recommendedActions: z.string().describe('Immediate, actionable steps the farmer should take right now (e.g., Isolate sick birds, provide fresh water with electrolytes).'),
  preventativeMeasures: z.string().describe('Long-term preventative measures to avoid this issue in the future (e.g., Improve litter management, review vaccination schedule).'),
});
export type DiagnoseChickenHealthOutput = z.infer<typeof DiagnoseChickenHealthOutputSchema>;

export async function diagnoseChickenHealth(input: DiagnoseChickenHealthInput): Promise<DiagnoseChickenHealthOutput> {
  return diagnoseChickenHealthFlow(input);
}

const promptTemplate = `You are a specialized poultry veterinarian AI. Your task is to diagnose potential diseases in a chicken flock based on the information provided by a farmer.

Analyze the following data carefully:
- Flock Age: {{{flockAgeWeeks}}} weeks
- Observed Symptoms: {{{symptoms}}}
{{#if photoDataUri}}
- Photo Evidence: {{media url=photoDataUri}}
{{/if}}

Based on this information, provide a diagnosis. Your response must be in a structured JSON format.

1.  **possibleDiseases**: Identify 1 to 3 potential diseases. For each disease, provide its name, likelihood (High, Medium, or Low), and a brief reasoning connecting the symptoms to the diagnosis.
2.  **recommendedActions**: List 2-3 critical, immediate actions the farmer must take to manage the situation and prevent further spread.
3.  **preventativeMeasures**: Suggest 2-3 long-term measures to prevent similar issues in the future.

Prioritize common diseases and consider the flock's age. For example, Gumboro is more common in young chicks. Coccidiosis is often linked to bloody diarrhea and wet litter. Consider the flock's vaccination history if available. An unvaccinated flock is more susceptible to diseases like Gumboro or Newcastle disease. Provide clear, concise, and practical advice.`;


const diagnosePrompt = ai.definePrompt({
  name: 'diagnoseChickenHealthPrompt',
  input: {schema: DiagnoseChickenHealthInputSchema},
  output: {schema: DiagnoseChickenHealthOutputSchema},
  prompt: promptTemplate,
});

const diagnoseChickenHealthFlow = ai.defineFlow(
  {
    name: 'diagnoseChickenHealthFlow',
    inputSchema: DiagnoseChickenHealthInputSchema,
    outputSchema: DiagnoseChickenHealthOutputSchema,
  },
  async input => {
    const {output} = await diagnosePrompt(input);
    return output!;
  }
);
