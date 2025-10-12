
'use server';

/**
 * @fileOverview Analyzes farm data to provide key metrics and a summary.
 *
 * - getFarmAnalytics - A function that returns farm analytics.
 * - FarmAnalyticsInput - The input type for the getFarmAnalytics function.
 * - FarmAnalyticsOutput - The return type for the getFarmAnalytics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Batch } from '@/lib/types';

const FarmAnalyticsInputSchema = z.object({
  batches: z.array(z.any()).describe('An array of active batch objects for the farm.'),
});
export type FarmAnalyticsInput = z.infer<typeof FarmAnalyticsInputSchema>;

const FarmAnalyticsOutputSchema = z.object({
  totalLiveBirds: z.number().describe('The total number of live birds across all active batches.'),
  overallMortalityRate: z.number().describe('The weighted average mortality rate across all active batches (percentage).'),
  totalFeedConsumed: z.number().describe('The total amount of feed consumed across all active batches (in kg).'),
  averageFCR: z.number().describe('The weighted average Feed Conversion Ratio (FCR) across all active batches.'),
  summary: z.string().describe('A brief, insightful summary of the overall farm status, highlighting any areas of concern or positive trends.'),
});
export type FarmAnalyticsOutput = z.infer<typeof FarmAnalyticsOutputSchema>;

export async function getFarmAnalytics(
  input: FarmAnalyticsInput
): Promise<FarmAnalyticsOutput> {
  return getFarmAnalyticsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFarmAnalyticsPrompt',
  input: {schema: FarmAnalyticsInputSchema},
  output: {schema: FarmAnalyticsOutputSchema},
  prompt: `You are a poultry farm data analyst. Analyze the following JSON data for active batches and calculate the specified metrics.

  Batches Data:
  {{{json batches}}}

  Based on the data, calculate the following:
  1.  **totalLiveBirds**: Sum of (totalChicks - mortalityCount) for all batches.
  2.  **overallMortalityRate**: Weighted average mortality rate. Calculated as (total mortality for all batches / total initial chicks for all batches) * 100.
  3.  **totalFeedConsumed**: Sum of feedConsumed for all batches.
  4.  **averageFCR**: Weighted average FCR. First, calculate FCR for each batch (feedConsumed * 1000 / ((totalChicks - mortalityCount) * avgBodyWeight)). Then, calculate the weighted average based on the number of live birds in each batch. If there are no live birds or zero weight, FCR should be considered 0 for that batch.
  5.  **summary**: Provide a concise, 1-2 sentence summary of the farm's health. For example, mention if mortality is high, if FCR is good, or if feed consumption seems unusual.

  Return the results in the specified JSON format.
`,
});

const getFarmAnalyticsFlow = ai.defineFlow(
  {
    name: 'getFarmAnalyticsFlow',
    inputSchema: FarmAnalyticsInputSchema,
    outputSchema: FarmAnalyticsOutputSchema,
  },
  async input => {
    if (input.batches.length === 0) {
      return {
        totalLiveBirds: 0,
        overallMortalityRate: 0,
        totalFeedConsumed: 0,
        averageFCR: 0,
        summary: "No active batches found. Add a batch to see your farm's analytics.",
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
