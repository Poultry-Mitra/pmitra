
'use server';

/**
 * @fileOverview AI-driven suggestions for farm improvements.
 *
 * - suggestFarmImprovements - A function that provides farm improvement suggestions.
 */

import {ai, z} from '@/ai/genkit';

const SuggestFarmImprovementsInputSchema = z.object({
  productionRate: z.number().describe('Current egg production rate (eggs per hen per day).'),
  mortalityRate: z.number().describe('Current mortality rate (percentage of hens dying per week).'),
  feedConsumption: z
    .number()
    .describe('Current feed consumption (grams per hen per day).'),
  farmSize: z.number().describe('The number of chickens on the farm.'),
});
export type SuggestFarmImprovementsInput = z.infer<typeof SuggestFarmImprovementsInputSchema>;


const SuggestFarmImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('AI-driven suggestions for improving farm efficiency and productivity.'),
});
export type SuggestFarmImprovementsOutput = z.infer<typeof SuggestFarmImprovementsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'suggestFarmImprovementsPrompt',
  input: {schema: SuggestFarmImprovementsInputSchema},
  output: {schema: SuggestFarmImprovementsOutputSchema},
  prompt: `You are an AI assistant providing expert advice on poultry farming.

  Based on the following farm metrics, provide actionable suggestions to improve efficiency and productivity.

  Production Rate: {{productionRate}} eggs per hen per day
  Mortality Rate: {{mortalityRate}}% per week
  Feed Consumption: {{feedConsumption}} grams per hen per day
  Farm Size: {{farmSize}} chickens

  Focus on providing specific and practical recommendations related to:
  -Optimizing feeding strategies
  -Improving hen health and reducing mortality
  -Enhancing egg production

  Present your suggestions in a concise and easy-to-understand manner.
  Consider providing multiple suggestions when applicable.
`,
});

export async function suggestFarmImprovements(
  input: SuggestFarmImprovementsInput
): Promise<SuggestFarmImprovementsOutput> {
  return suggestFarmImprovementsFlow(input);
}

const suggestFarmImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestFarmImprovementsFlow',
    inputSchema: SuggestFarmImprovementsInputSchema,
    outputSchema: SuggestFarmImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
