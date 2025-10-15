
'use server';

/**
 * @fileOverview An AI flow to suggest biosecurity improvements based on a checklist.
 *
 * - suggestBiosecurityImprovements - A function that returns improvement suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBiosecurityImprovementsInputSchema = z.object({
  failedItems: z.array(z.string()).describe('A list of biosecurity checklist items that the user answered "No" to.'),
});
export type SuggestBiosecurityImprovementsInput = z.infer<typeof SuggestBiosecurityImprovementsInputSchema>;


const SuggestBiosecurityImprovementsOutputSchema = z.object({
  suggestions: z.string().describe('A detailed, actionable list of suggestions to improve biosecurity, formatted as a markdown list.'),
});
export type SuggestBiosecurityImprovementsOutput = z.infer<typeof SuggestBiosecurityImprovementsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'suggestBiosecurityImprovementsPrompt',
  input: {schema: SuggestBiosecurityImprovementsInputSchema},
  output: {schema: SuggestBiosecurityImprovementsOutputSchema},
  prompt: `You are a poultry farm biosecurity expert. A farmer has completed a checklist and failed on the following items. For each failed item, provide a detailed, practical, and actionable suggestion on how to fix it. Group your suggestions by the three pillars of biosecurity: Isolation, Traffic Control, and Sanitation.

  **Failed Checklist Items:**
  {{#each failedItems}}
  - {{{this}}}
  {{/each}}

  **Your Task:**
  Provide a response in markdown format. For each failed item, provide a clear heading and then 1-2 sentences explaining *why* it's a risk and 1-3 actionable bullet points on *how* to resolve it. Be encouraging and focus on low-cost, practical solutions where possible.

  **Example Response Format:**

  ### Isolation
  **Visitor Log Not Maintained**
  *Risk:* Without a log, you can't track who has been on your farm, making it impossible to trace the source of a potential disease outbreak.
  *Solution:*
  - Place a simple notebook and pen at your farm's entrance.
  - Require all visitors to sign in with their name, contact number, and the date.
  - Review the log weekly.

  ### Traffic Control
  ...
  `,
});

export async function suggestBiosecurityImprovements(
  input: SuggestBiosecurityImprovementsInput
): Promise<SuggestBiosecurityImprovementsOutput> {
  return suggestBiosecurityImprovementsFlow(input);
}

const suggestBiosecurityImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestBiosecurityImprovementsFlow',
    inputSchema: SuggestBiosecurityImprovementsInputSchema,
    outputSchema: SuggestBiosecurityImprovementsOutputSchema,
  },
  async input => {
    if (input.failedItems.length === 0) {
        return {
            suggestions: "Excellent! You've passed all biosecurity checks. Keep up the great work to ensure your flock stays healthy and profitable. Regular reviews of your protocols are recommended."
        };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
