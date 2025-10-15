'use server';

/**
 * @fileOverview A secure backend flow to create a user profile in Firestore.
 * This flow now constructs a user profile object without direct database interaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This schema is now internal and not exported to avoid breaking client-side builds.
const CreateProfileInputSchema = z.object({
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

// The input type is still exported for use in other server components if needed.
export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;

// The output schema defines the shape of the object this flow returns.
const CreateProfileOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userProfile: z.any().optional(), // The profile object to be saved on the client.
});
export type CreateProfileOutput = z.infer<typeof CreateProfileOutputSchema>;

// The main exported function that can be called from server components.
export async function createProfile(input: CreateProfileInput): Promise<CreateProfileOutput> {
  // This is now a simple async function, no Genkit flow needed.
  try {
    const userProfile: any = {
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      planType: input.planType,
      mobileNumber: input.mobileNumber || "",
      state: input.state,
      district: input.district,
      pinCode: input.pinCode || "",
      aiQueriesCount: 0,
      lastQueryDate: "",
      dateJoined: new Date().toISOString(),
    };

    if (input.role === 'farmer') {
      userProfile.poultryMitraId = `PM-FARM-${input.uid.substring(0, 5).toUpperCase()}`;
      userProfile.connectedDealers = [];
    }
    if (input.role === 'dealer') {
      userProfile.uniqueDealerCode = `DL-${input.uid.substring(0, 8).toUpperCase()}`;
      userProfile.connectedFarmers = [];
    }
    
    return {
      success: true,
      message: 'User profile object created successfully.',
      userProfile: userProfile,
    };
  } catch (error: any) {
    console.error('Error creating profile object:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred while creating the profile object.',
    };
  }
}
