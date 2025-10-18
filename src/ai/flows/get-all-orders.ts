'use server';
/**
 * @fileOverview A flow for administrators to fetch all orders from the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeAdminApp } from '@/firebase/admin-config';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { Order } from '@/lib/types';

const GetAllOrdersInputSchema = z.object({
  adminUid: z.string().describe('The UID of the user requesting the data, for verification.'),
});

const GetAllOrdersOutputSchema = z.object({
  orders: z.array(z.any()).describe('An array of all order objects.'),
});

export const getAllOrders = ai.defineFlow(
  {
    name: 'getAllOrdersFlow',
    inputSchema: GetAllOrdersInputSchema,
    outputSchema: GetAllOrdersOutputSchema,
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
      const ordersSnapshot = await adminFirestore.collection('orders').get();
      
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure date fields are serializable (ISO strings)
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Order;
      });

      return { orders };
    } catch (error: any) {
      console.error("Error in getAllOrdersFlow:", error);
      return { orders: [] };
    }
  }
);
