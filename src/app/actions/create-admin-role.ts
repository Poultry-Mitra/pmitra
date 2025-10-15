
'use server';

import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This is a simplified, client-SDK based action to avoid Admin SDK issues.
// It should only be called from a trusted environment like the one-time setup page.

/**
 * Sets the admin role for a given user UID by creating a document in the 'roles_admin' collection.
 * This action is intended for one-time use to set up the initial admin.
 * @param uid The user ID to grant admin privileges to.
 * @param email The user's email.
 * @returns An object indicating the success or failure of the operation.
 */
export async function createAdminRole(uid: string, email: string): Promise<{ success: boolean; message: string }> {
  try {
    // We need to initialize a temporary app instance here to use the client SDK on the server.
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    const adminRoleRef = doc(db, 'roles_admin', uid);

    await setDoc(adminRoleRef, {
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
