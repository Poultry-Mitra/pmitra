
'use server';

/**
 * @fileOverview Analyzes farm data to provide key metrics and a summary.
 *
 * - getFarmAnalytics - A function that returns farm analytics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Batch } from '@/lib/types';

const FarmAnalyticsInputSchema = z.object({
  batches: z.array(z.any()).describe('An array of all batch objects (active and completed) for the farm.'),
});
export type FarmAnalyticsInput = z.infer<typeof FarmAnalyticsInputSchema>;


const FarmAnalyticsOutputSchema = z.object({
  totalLiveBirds: z.number().describe('The total number of live birds across all active batches.'),
  overallMortalityRate: z.number().describe('The weighted average mortality rate across all batches (active and completed) as a percentage.'),
  totalFeedConsumed: z.number().describe('The total amount of feed consumed across all active batches (in kg).'),
  averageFCR: z.number().describe('The weighted average Feed Conversion Ratio (FCR) across all batches (active and completed).'),
  summary: z.string().describe('A brief, insightful summary of the overall farm performance, analyzing trends over time and highlighting key strengths and areas for improvement. This should be more than just stating the numbers.'),
});
export type FarmAnalyticsOutput = z.infer<typeof FarmAnalyticsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'getFarmAnalyticsPrompt',
  input: {schema: FarmAnalyticsInputSchema},
  output: {schema: FarmAnalyticsOutputSchema},
  prompt: `You are a poultry farm data analyst. Analyze the following JSON data for all of a farmer's batches (both active and completed) and calculate the specified metrics.

  Batches Data:
  {{{json batches}}}

  Based on the data, calculate the following:
  1.  **totalLiveBirds**: Sum of (totalChicks - mortalityCount) for all *active* batches only.
  2.  **overallMortalityRate**: Weighted average mortality rate across *all* batches. Calculated as (total mortality for all batches / total initial chicks for all batches) * 100.
  3.  **totalFeedConsumed**: Sum of feedConsumed for all *active* batches only.
  4.  **averageFCR**: Weighted average FCR across *all* batches. First, calculate FCR for each batch (feedConsumed / ( (totalChicks - mortalityCount) * (avgBodyWeight - 40) / 1000 )). The initial weight of a chick is 40 grams. If weight gain for a batch is zero or negative, its FCR is 0. Then, calculate the weighted average of all batch FCRs based on the number of live birds in each batch. If total live birds are zero, the average FCR should be 0.
  5.  **summary**: Provide a concise, 2-3 sentence summary of the farm's overall performance. This is the most important part. Do not just state the numbers. Analyze the data to identify **trends over time**. Are key metrics like FCR or mortality rate improving or worsening across batches? Highlight one key strength (e.g., "FCR has consistently improved") and one key area for improvement (e.g., "Early-stage mortality remains a challenge").
  
  Return the results in the specified JSON format.
`,
});

export async function getFarmAnalytics(
  input: FarmAnalyticsInput
): Promise<FarmAnalyticsOutput> {
  return getFarmAnalyticsFlow(input);
}

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
