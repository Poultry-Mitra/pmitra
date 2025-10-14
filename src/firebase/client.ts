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
  
  // Initialize the Firebase app if it hasn't been already.
  if (!getApps().length) {
    // Final check: Ensure all necessary config values are strings and present.
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.authDomain ||
      !firebaseConfig.projectId
    ) {
      console.error("Firebase config is missing or incomplete. Firebase will not be initialized.");
      return { firebaseApp: null, auth: null, firestore: null };
    }
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}
