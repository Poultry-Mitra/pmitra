import { config } from 'dotenv';
config();

// This file imports Genkit flows for development purposes.
// Modifying this file can help trigger a full cache refresh in Next.js.

import '@/ai/flows/ai-query-poultry.ts';
import '@/ai/flows/recommend-optimal-feed.ts';
import '@/ai/flows/suggest-farm-improvements.ts';
import '@/ai/flows/forecast-potential-problems.ts';
import '@/ai/flows/get-farm-analytics.ts';
import '@/ai/flows/diagnose-chicken-health.ts';
import '@/ai/flows/site-expert.ts';
import '@/ai/flows/suggest-biosecurity-improvements.ts';
