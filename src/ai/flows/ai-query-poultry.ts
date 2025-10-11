'use server';

/**
 * @fileOverview A flow that answers user questions about poultry farming.
 *
 * - aiQueryPoultry - A function that handles the query process.
 * - AIQueryPoultryInput - The input type for the aiQueryPoultry function.
 * - AIQueryPoultryOutput - The return type for the aiQueryPoultry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIQueryPoultryInputSchema = z.object({
  query: z.string().describe('The question about poultry farming.'),
});
export type AIQueryPoultryInput = z.infer<typeof AIQueryPoultryInputSchema>;

const AIQueryPoultryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AIQueryPoultryOutput = z.infer<typeof AIQueryPoultryOutputSchema>;

export async function aiQueryPoultry(input: AIQueryPoultryInput): Promise<AIQueryPoultryOutput> {
  return aiQueryPoultryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQueryPoultryPrompt',
  input: {schema: AIQueryPoultryInputSchema},
  output: {schema: AIQueryPoultryOutputSchema},
  prompt: `You are an expert in poultry farming. Answer the following question about poultry farming:\n\n{{{query}}}`,
});

const aiQueryPoultryFlow = ai.defineFlow(
  {
    name: 'aiQueryPoultryFlow',
    inputSchema: AIQueryPoultryInputSchema,
    outputSchema: AIQueryPoultryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
