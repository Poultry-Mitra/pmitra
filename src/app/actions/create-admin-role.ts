
'use server';

import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// THIS IS A TEMPORARY, INSECURE ACTION FOR ONE-TIME SETUP.
// IT BYPASSES STANDARD AUTH CHECKS TO CREATE THE INITIAL ADMIN.

export async function createAdminRole(uid: string, email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Initialize a temporary app instance. This is safe for a server action.
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    const adminRoleRef = doc(db, 'roles_admin', uid);

    // Directly set the document. Security rules will be temporarily adjusted to allow this.
    await setDoc(adminRole_ref, {
      email: email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log(`Admin role document created for UID: ${uid}`);
    return { success: true, message: `Admin role document created for ${email}.` };
  } catch (error: any) {
    console.error('Error in temporary createAdminRole action:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during the temporary setup.' };
  }
}
