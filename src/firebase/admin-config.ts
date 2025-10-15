'use server';

import * as admin from 'firebase-admin';
import { firebaseConfig } from './config';

// Construct the service account object using a combination of the reliable
// firebaseConfig for the project ID and environment variables for secrets.
const serviceAccount = {
  projectId: firebaseConfig.projectId, // Use the already available and correct projectId
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

/**
 * Initializes the Firebase Admin app if it hasn't been already.
 * This function now correctly uses the service account object.
 * @returns The initialized Firebase Admin app instance.
 */
export async function initializeAdminApp() {
  if (admin.apps.length === 0) {
    // Directly pass the keys to the cert function, which expects this format.
    // The SDK will correctly map projectId to project_id internally.
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.app();
}
