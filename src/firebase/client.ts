'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Module-level variables to act as a singleton.
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Initializes and/or returns the Firebase services singleton.
 * This function is safe to call multiple times and will only initialize once.
 * It is designed to be called ONLY on the client-side.
 */
export function initializeFirebase() {
  // On the server, return null services.
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // If already initialized, return the existing instances.
  if (firebaseApp) {
    return { firebaseApp, auth, firestore };
  }

  // Check if the necessary Firebase config values are present.
  // This is the definitive fix for the "invalid-api-key" error.
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
  ) {
    // If config is missing, log an error and return nulls.
    // This prevents the app from crashing.
    console.error("Firebase configuration is missing or incomplete. Please check your environment variables.");
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Initialize the Firebase app if it hasn't been already.
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}
