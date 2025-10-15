'use server';
/**
 * @fileOverview A flow for administrators to fetch all users from the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeAdminApp } from '@/firebase/admin-config';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { User } from '@/lib/types';

const GetAllUsersInputSchema = z.object({
  adminUid: z.string().describe('The UID of the user requesting the data, for verification.'),
});

const GetAllUsersOutputSchema = z.object({
  users: z.array(z.any()).describe('An array of all user objects.'),
});

export const getAllUsers = ai.defineFlow(
  {
    name: 'getAllUsersFlow',
    inputSchema: GetAllUsersInputSchema,
    outputSchema: GetAllUsersOutputSchema,
  },
  async (input) => {
    try {
      const adminApp = await initializeAdminApp();
      const adminAuth = getAuth(adminApp);
      const userRecord = await adminAuth.getUser(input.adminUid);

      // Security Check: Ensure the user is the designated admin
      if (userRecord.email !== 'ipoultrymitra@gmail.com') {
        throw new Error('Unauthorized: Only the primary admin can perform this action.');
      }
      
      const adminFirestore = getFirestore(adminApp);
      const usersSnapshot = await adminFirestore.collection('users').get();
      
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure date fields are serializable (ISO strings)
        return {
          id: doc.id,
          ...data,
          dateJoined: data.dateJoined?.toDate ? data.dateJoined.toDate().toISOString() : data.dateJoined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate().toISOString() : data.lastUpdated,
        } as User;
      });

      return { users };
    } catch (error: any) {
      console.error("Error in getAllUsersFlow:", error);
      // It's better to return an empty array than to throw, to prevent crashing the client UI.
      // The error will be logged on the server.
      return { users: [] };
    }
  }
);
