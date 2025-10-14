'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let services: FirebaseServices | null = null;

/**
 * Initializes and/or returns the Firebase services singleton.
 * This function is safe to call multiple times and on both server and client.
 * On the server, it will return null. On the client, it initializes Firebase once.
 */
export function initializeFirebase(): FirebaseServices | null {
  // Return null on the server
  if (typeof window === 'undefined') {
    return null;
  }

  // If services are already initialized, return them.
  if (services) {
    return services;
  }

  // Check if Firebase app is already initialized by other means
  if (!getApps().length) {
    // Final check: Ensure all necessary config values are strings and present.
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.authDomain ||
      !firebaseConfig.projectId
    ) {
      console.error("Firebase config is missing or incomplete. Firebase will not be initialized.");
      return null;
    }
    initializeApp(firebaseConfig);
  }
  
  const firebaseApp = getApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  services = { firebaseApp, auth, firestore };

  return services;
}
