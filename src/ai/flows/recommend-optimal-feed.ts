'use server';

/**
 * @fileOverview Recommends optimal feed based on farm production data.
 *
 * - recommendOptimalFeed - A function that recommends optimal feed based on farm production data.
 * - RecommendOptimalFeedInput - The input type for the recommendOptimalFeed function.
 * - RecommendOptimalFeedOutput - The return type for the recommendOptimalFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendOptimalFeedInputSchema = z.object({
  productionRate: z.number().describe('The current egg production rate of the farm (eggs per day).'),
  mortalityRate: z.number().describe('The current mortality rate of the farm (percentage).'),
  feedConsumption: z.number().describe('The current feed consumption of the farm (kg per day).'),
  chickenAgeWeeks: z.number().describe('The average age of the chickens in weeks.'),
  environmentalConditions: z.string().describe('Description of the environmental conditions of the farm (temperature, humidity, etc.).'),
});
export type RecommendOptimalFeedInput = z.infer<typeof RecommendOptimalFeedInputSchema>;

const RecommendOptimalFeedOutputSchema = z.object({
  recommendation: z.string().describe('The AI-powered feed recommendation.'),
  reasoning: z.string().describe('The reasoning behind the recommendation.'),
});
export type RecommendOptimalFeedOutput = z.infer<typeof RecommendOptimalFeedOutputSchema>;

export async function recommendOptimalFeed(input: RecommendOptimalFeedInput): Promise<RecommendOptimalFeedOutput> {
  return recommendOptimalFeedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendOptimalFeedPrompt',
  input: {schema: RecommendOptimalFeedInputSchema},
  output: {schema: RecommendOptimalFeedOutputSchema},
  prompt: `You are an expert poultry nutritionist. Analyze the following farm data and provide a feed recommendation. Explain your reasoning.  Consider chicken age when creating the recommendation.

Farm Data:
Production Rate: {{{productionRate}}} eggs/day
Mortality Rate: {{{mortalityRate}}}%
Feed Consumption: {{{feedConsumption}}} kg/day
Chicken Age: {{{chickenAgeWeeks}}} weeks
Environmental Conditions: {{{environmentalConditions}}}

Recommendation:
Reasoning:`, 
});

const recommendOptimalFeedFlow = ai.defineFlow(
  {
    name: 'recommendOptimalFeedFlow',
    inputSchema: RecommendOptimalFeedInputSchema,
    outputSchema: RecommendOptimalFeedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
