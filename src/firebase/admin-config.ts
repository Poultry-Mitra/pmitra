'use server';

import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin app if it hasn't been already.
 * This function is now simplified to use Default Application Credentials,
 * which are automatically available in the Firebase Studio environment.
 * This removes the need to manually handle service account keys and `.env` files.
 * @returns The initialized Firebase Admin app instance.
 */
export async function initializeAdminApp() {
  if (admin.apps.length === 0) {
    // This will automatically use the configured service account in the environment.
    return admin.initializeApp();
  }
  return admin.app();
}
