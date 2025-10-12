
'use server';

/**
 * @fileOverview A flow to forecast potential diseases or productivity drops based on sensor data.
 *
 * - forecastPotentialProblems - A function that handles the forecasting process.
 * - ForecastPotentialProblemsInput - The input type for the forecastPotentialProblems function.
 * - ForecastPotentialProblemsOutput - The return type for the forecastPotentialProblems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastPotentialProblemsInputSchema = z.object({
  sensorData: z.string().describe('A JSON string containing the latest sensor data from the farm.  Include timestamps, temperature, humidity, ammonia levels, feed consumption, water consumption, and any other relevant data.'),
  historicalData: z.string().describe('A JSON string containing historical sensor data from the farm, covering at least the last 30 days. Include timestamps, temperature, humidity, ammonia levels, feed consumption, water consumption, mortality rates, production rates, and any other relevant data.'),
});
export type ForecastPotentialProblemsInput = z.infer<typeof ForecastPotentialProblemsInputSchema>;

const ForecastPotentialProblemsOutputSchema = z.object({
  forecast: z.string().describe('A detailed forecast of potential diseases or productivity drops, including the likelihood of each issue, the potential impact, and recommended preventative measures.'),
});
export type ForecastPotentialProblemsOutput = z.infer<typeof ForecastPotentialProblemsOutputSchema>;

export async function forecastPotentialProblems(input: ForecastPotentialProblemsInput): Promise<ForecastPotentialProblemsOutput> {
  return forecastPotentialProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastPotentialProblemsPrompt',
  input: {schema: ForecastPotentialProblemsInputSchema},
  output: {schema: ForecastPotentialProblemsOutputSchema},
  prompt: `You are an expert in poultry farm management and disease prevention. Analyze the provided sensor data and historical data to forecast potential problems.

Sensor Data:
{{sensorData}}

Historical Data:
{{historicalData}}

Based on this data, provide a detailed forecast of potential diseases or productivity drops, including the likelihood of each issue, the potential impact, and recommended preventative measures.  Consider trends, anomalies, and correlations in the data.

Format your response as a detailed paragraph.`, // add detailed paragraph to force the format
});

const forecastPotentialProblemsFlow = ai.defineFlow(
  {
    name: 'forecastPotentialProblemsFlow',
    inputSchema: ForecastPotentialProblemsInputSchema,
    outputSchema: ForecastPotentialProblemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
