
'use server';

import { siteExpert } from '@/ai/flows/site-expert';
import { z } from 'zod';

const SiteExpertInputSchema = z.object({
  query: z.string(),
});

export async function siteExpertAction(input: z.infer<typeof SiteExpertInputSchema>) {
  return await siteExpert(input);
}
