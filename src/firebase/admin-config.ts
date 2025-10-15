
'use server';

import * as admin from 'firebase-admin';

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

/**
 * Initializes the Firebase Admin app if it hasn't been already.
 * @returns The initialized Firebase Admin app instance.
 */
export async function initializeAdminApp() {
  if (admin.apps.length === 0) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.app();
}
