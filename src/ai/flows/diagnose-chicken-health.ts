
'use server';

/**
 * @fileOverview An AI flow to diagnose chicken health problems based on symptoms.
 *
 * - diagnoseChickenHealth - A function that handles the diagnosis process.
 */

import {ai} from '@/ai/genkit';
import type { DiagnoseChickenHealthInput, DiagnoseChickenHealthOutput } from '@/lib/types';
import { DiagnoseChickenHealthInputSchema, DiagnoseChickenHealthOutputSchema } from '@/lib/schemas';


const promptTemplate = `You are a specialized poultry veterinarian AI named Chickrate AI. Your primary audience is small to medium-scale poultry farmers in Bihar, India. Your task is to diagnose potential diseases in a chicken flock based on the information provided by a farmer. Your response MUST be in the specified JSON format.

Analyze the following data carefully. Pay close attention to combinations of symptoms across different categories (e.g., respiratory + digestive), as this is key to an accurate diagnosis. The flock age is critical.

- Flock Age: {{{flockAgeDays}}} days
- Observed Symptoms: {{{symptoms}}}
{{#if photoDataUri}}
- Photo Evidence: {{media url=photoDataUri}} (Analyze this photo for visible signs like lesions, posture, swelling, or dropping consistency. This is a primary piece of evidence.)
{{/if}}

Based on this information, provide a detailed diagnosis. Your response MUST be in a structured JSON format.

1.  **possibleDiseases**: Identify the top 2-3 most likely diseases. For each disease, provide its name, a likelihood (High, Medium, or Low), and a very clear reasoning. The reasoning MUST connect the specific symptoms and flock age to the diagnosis. For example: "The combination of bloody diarrhea and the flock's age (4 weeks) is a classic sign of Coccidiosis."

2.  **treatmentPlan**: Provide a detailed, step-by-step plan that is highly practical and action-oriented for a small farmer. Be specific. Instead of "Give medicine", say "Administer Amprolium in drinking water". For each step, provide a short 'step' title and a longer 'details' explanation. Include steps for:
    a. Isolation of sick birds.
    b. Specific medication/treatment for the most likely disease (mention drug names and administration methods).
    c. Supportive care (e.g., vitamins, electrolytes, temperature management).
    d. Sanitation and disinfection procedures.

3.  **preventativeMeasures**: Suggest 3-4 practical, long-term measures to prevent these specific issues in the future. Focus on biosecurity, vaccination, and management practices.

4.  **biharSpecificAdvice**: Provide a crucial piece of advice specifically for farmers in Bihar, India. This MUST BE IN HINDI. Mention locally relevant information, such as the name of a common government veterinary hospital, a specific KVK (Krishi Vigyan Kendra), or a well-known local medicine brand. Example: "रानीखेत रोग से बचाव के लिए, पास के सरकारी पशु अस्पताल में मुफ्त टीकाकरण की जानकारी लें।"

Your final output must be a valid JSON object adhering to the schema.
`;


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
