
'use server';

/**
 * @fileOverview A flow to construct a user profile object.
 * This flow is designed to be called after user authentication to securely
 * prepare the data structure for a new user, which will then be saved
 * to Firestore by the client. It does not perform any database operations itself.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CreateProfileInputSchema = z.object({
  uid: z.string().describe("The user's Firebase Authentication UID."),
  name: z.string().describe("The user's full name."),
  email: z.string().email().describe("The user's email address."),
  role: z.enum(['farmer', 'dealer', 'admin']).describe("The user's role."),
  status: z.enum(['Pending', 'Active', 'Suspended']).describe("The user's status."),
  planType: z.enum(['free', 'premium']).describe("The user's subscription plan."),
  mobileNumber: z.string().optional().describe("The user's mobile number."),
  state: z.string().describe("The user's state."),
  district: z.string().describe("The user's district."),
  pinCode: z.string().optional().describe("The user's pin code."),
});
export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;

// The output is essentially the data that needs to be saved to Firestore.
const CreateProfileOutputSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['farmer', 'dealer', 'admin']),
    status: z.enum(['Pending', 'Active', 'Suspended']),
    planType: z.enum(['free', 'premium']),
    mobileNumber: z.string().optional(),
    state: z.string(),
    district: z.string(),
    pinCode: z.string().optional(),
    aiQueriesCount: z.number(),
    lastQueryDate: z.string(),
    dateJoined: z.string(),
    uniqueDealerCode: z.string().optional(),
    connectedFarmers: z.array(z.string()).optional(),
    connectedDealers: z.array(z.string()).optional(),
});
export type CreateProfileOutput = z.infer<typeof CreateProfileOutputSchema>;


export async function createProfile(input: CreateProfileInput): Promise<CreateProfileOutput> {
  return createProfileFlow(input);
}

const createProfileFlow = ai.defineFlow(
  {
    name: 'createProfileFlow',
    inputSchema: CreateProfileInputSchema,
    outputSchema: CreateProfileOutputSchema,
  },
  async (input) => {
    
    const userProfile: Omit<CreateProfileOutput, 'id'> = {
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      planType: input.planType,
      mobileNumber: input.mobileNumber || undefined,
      state: input.state,
      district: input.district,
      pinCode: input.pinCode || undefined,
      aiQueriesCount: 0,
      lastQueryDate: "",
      dateJoined: new Date().toISOString(),
    };

    if (input.role === 'dealer') {
      userProfile.uniqueDealerCode = `DL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      userProfile.connectedFarmers = [];
    }
    if (input.role === 'farmer') {
      userProfile.connectedDealers = [];
    }
      
    // The flow now simply returns the structured object.
    // The client is responsible for writing this to Firestore.
    return userProfile as CreateProfileOutput;
  }
);
