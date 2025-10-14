
'use server';

/**
 * @fileOverview A secure backend flow to create a user profile in Firestore.
 * This flow uses the Firebase Admin SDK to bypass security rules, ensuring
 * reliable profile creation immediately after authentication.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    // These credentials will be automatically sourced from the environment
    // in a Firebase/Google Cloud environment.
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();

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

const CreateProfileOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
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
    try {
      const userDocRef = firestore.collection('users').doc(input.uid);

      const userProfile: any = {
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
      
      await userDocRef.set(userProfile);

      return {
        success: true,
        message: 'User profile created successfully.',
      };
    } catch (error: any) {
      console.error('Error creating profile in flow:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred while creating the profile.',
      };
    }
  }
);
