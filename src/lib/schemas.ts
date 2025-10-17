import { z } from 'zod';

export const DiseasePossibilitySchema = z.object({
    name: z.string().describe('The name of the possible disease (e.g., Coccidiosis, Marek\'s Disease).'),
    likelihood: z.enum(['High', 'Medium', 'Low']).describe('The likelihood of this disease being the cause.'),
    reasoning: z.string().describe('A brief explanation of why this disease is considered a possibility based on the provided symptoms and age.'),
});

export const TreatmentStepSchema = z.object({
    step: z.string().describe("A single, clear, actionable step title (e.g., 'Isolate Sick Birds')."),
    details: z.string().describe("A more detailed explanation for the step, including why it's important and how to do it.")
});

export const DiagnoseChickenHealthInputSchema = z.object({
  symptoms: z.string().describe('A comma-separated string of symptoms observed in the chicken(s), such as bloody diarrhea, ruffled feathers, paralysis, coughing, sneezing, etc.'),
  flockAgeDays: z.number().int().describe('The age of the flock in days.'),
  photoDataUri: z.string().optional().describe("A photo of the sick chicken or its droppings, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export const DiagnoseChickenHealthOutputSchema = z.object({
  possibleDiseases: z.array(DiseasePossibilitySchema).describe('A list of 1 to 3 possible diseases, ranked by likelihood.'),
  treatmentPlan: z.array(TreatmentStepSchema).describe("A step-by-step treatment and management plan. This should be very detailed and practical for a small-scale farmer."),
  preventativeMeasures: z.array(z.string()).describe('A list of 2-4 long-term preventative measures to avoid this issue in the future.'),
  biharSpecificAdvice: z.string().describe("Specific advice relevant to farmers in Bihar, India. Mention locally available medicine brands or government resources if applicable. THIS MUST BE IN HINDI."),
});
