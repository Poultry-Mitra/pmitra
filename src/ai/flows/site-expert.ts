
'use server';
/**
 * @fileOverview A flow that acts as a site expert, answering questions based on provided poultry farming guides.
 *
 * - siteExpert - A function that handles the query process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SiteExpertInputSchema = z.object({
  query: z.string().describe('The user\'s question about poultry farming.'),
});

const SiteExpertOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, based on the provided context.'),
});

const poultryGuideContext = `
What is Broiler chicken?
A broiler chicken is a specific type of chicken raised primarily for meat production. The term “broiler” refers to chickens selectively bred to grow rapidly and efficiently convert feed into lean muscle mass.

Broilers are specifically bred for meat production, unlike egg-laying hens or breeds used for both meat and eggs.

Broilers are characterized by their impressive growth rates, reaching a market weight of 1.8 kg-3.5 kg (4–6 pounds) in just 5–7 weeks. This quick growth is achieved through a carefully balanced diet and optimal environmental conditions tailored to support their fast development.

This guide is for beginners who want to learn about raising broiler chickens for meat. It will teach you how to choose the right type of bird, set up the space where the chicks will live, and take care of the baby chicks, so they grow up healthy.

We’ll discuss the best food for them, vaccination schedules, and common diseases in broiler chickens. Follow these steps to raise a flock of broiler chickens successfully.

Some Basic Information about Meat Chickens
1. Broiler chickens grow fast and can reach a good size for eating in 5–8 weeks.
2. Broiler chickens are easy to rear, whether you have a small backyard flock or a big commercial operation.
3. Broilers need special care like vaccinations, medicines, good ventilation, and high-quality food because they aren’t very hardy birds.
4. Broilers get different kinds of special feed as they grow – starter, grower, and finisher.
5. Broiler meat is very juicy and tasty compared to other poultry.
6. Broilers don’t do well roaming free; they should be raised in coops or pens with litter on the floor.
7. Broiler hens can lay eggs like other chickens and mate with roosters of different breeds.
8. There are different kinds of strains of broilers like Hubbard, Ross, Cobb, Arbor Acres, and Marshall.

Choosing the Right Broiler Breed
When starting a broiler operation, selecting the right breed is crucial for success. Several major poultry breeding companies have developed specialized broiler chicken breeds optimized for various production goals.
Popular commercial broiler breeds include: Hubbard, Marshall, Cobb, Arbor Acres, Ross.

Setting Up a Broiler Chicken Pen/Coop
- Each bird needs about 0.8 to 1 square foot of space.
- Good ventilation is crucial to prevent heat stress and remove bad air. Use fans and cooling pads.
- Use dry bedding like wood shavings or rice hulls (litter). Keep it dry.

Types of Housing Systems for Broiler Farming
1. Deep-Litter System: Chickens live on a floor covered with thick bedding (wood shavings, straw).
2. Battery Cage System: Chickens live in small wire cages stacked in rows.
3. Free-Range System: Chickens have access to an outdoor area during the day.

Broiler Chicken Nutrition
Feeding programs consist of three main phases:
1. Starter Feed (0-2 weeks): Protein level around 22%.
2. Grower Feed (3-4 weeks): Protein level 18-20%.
3. Finisher Feed (4+ weeks): Protein level 16-18%, higher in energy.
Constant access to fresh, clean water is crucial.

Broiler Chick Brooding
The first 10-14 days are critical.
- Temperature: Start at 95°F (35°C) and decrease by 5°F (2.8°C) each week until it reaches 70°F (21°C).
- Recommended temperatures: Day 1: 35°C, Day 2: 32°C, Day 7: 31°C, Day 14: 27°C.
- Use a brooder guard to keep chicks near heat, food, and water.

Broiler Chicken Health and Biosecurity
- High biosecurity is essential. Restrict visitors, sanitize equipment, and provide a clean environment.
- Vaccinate against common diseases like Newcastle, Gumboro, and Infectious Bronchitis.
- Recommended Medication Routine: Day 1-3: Antibiotics + Multivitamins, Day 5-6: Coccidiostats, Day 7: Multivitamins, Day 42-43: Dewormer.

Common Diseases of Broilers
1. Coccidiosis: Caused by parasites, signs include bloody diarrhea. Prevented with medication and dry litter.
2. Marek’s Disease: Viral disease causing paralysis. Prevented by vaccination at the hatchery.
3. Infectious Bronchitis: Contagious respiratory virus.
4. Newcastle Disease: Highly infectious viral illness.
5. Gumboro Disease (Infectious Bursal Disease): Attacks the immune system in young chicks.
`;

const prompt = ai.definePrompt({
  name: 'siteExpertPrompt',
  input: {schema: SiteExpertInputSchema},
  output: {schema: SiteExpertOutputSchema},
  prompt: `You are an expert poultry farming assistant for the PoultryMitra application. Your knowledge is based *exclusively* on the context provided below. Answer the user's question clearly and concisely in the same language as the query (English or Hindi). If the question cannot be answered from the context, politely say that you don't have information on that topic.

Context:
---
${poultryGuideContext}
---

Question: {{{query}}}
`,
});

export async function siteExpert(input: z.infer<typeof SiteExpertInputSchema>) {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI was unable to generate an answer.");
    }
    return output;
}
