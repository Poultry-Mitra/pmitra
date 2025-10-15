'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin-config';

/**
 * Sets the admin role for a given user UID.
 * This action is intended for one-time use to set up the initial admin.
 * @param uid The user ID to grant admin privileges to.
 * @returns An object indicating the success or failure of the operation.
 */
export async function createAdminRole(uid: string, email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure the admin app is initialized and get the app instance.
    const adminApp = await initializeAdminApp();
    
    // Get the Firestore instance from the initialized app.
    const db = getFirestore(adminApp);
    const adminRoleRef = db.collection('roles_admin').doc(uid);

    await adminRoleRef.set({
      email: email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log(`Admin role successfully set for UID: ${uid}`);
    return { success: true, message: `Admin role successfully set for ${email}.` };
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
