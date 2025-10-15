'use server';

import * as admin from 'firebase-admin';

/**
 * Initializes and returns the Firebase Admin app instance, ensuring it's a singleton.
 * This function is safe to call multiple times.
 */
export async function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // This will use the default credentials provided by the Google Cloud environment
    // in Firebase Studio, which is the most robust and secure method.
    return admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin Initialization Failed:', error);
    throw new Error('Could not initialize Firebase Admin SDK. Ensure the server environment is configured with the correct credentials.');
  }
}
