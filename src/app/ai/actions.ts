'use server';

import { aiQueryPoultry } from '@/ai/flows/ai-query-poultry';
import { z } from 'zod';

const AIQueryPoultryInputSchema = z.object({
  query: z.string(),
});

export async function aiQueryPoultryAction(input: z.infer<typeof AIQueryPoultryInputSchema>) {
  return await aiQueryPoultry(input);
}
