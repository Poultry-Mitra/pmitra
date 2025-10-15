
'use server';
/**
 * @fileOverview A flow that answers user questions about poultry farming.
 *
 * - aiQueryPoultry - A function that handles the query process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIQueryPoultryInputSchema = z.object({
  query: z.string().describe('The question about poultry farming.'),
});

const AIQueryPoultryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});

const prompt = ai.definePrompt({
  name: 'aiQueryPoultryPrompt',
  input: {schema: AIQueryPoultryInputSchema},
  output: {schema: AIQueryPoultryOutputSchema},
  prompt: `You are an expert in poultry farming. Answer the following question about poultry farming:\n\n{{{query}}}`,
});

export const aiQueryPoultry = ai.defineFlow(
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
