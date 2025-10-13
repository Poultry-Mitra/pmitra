'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This file ensures Firebase is initialized only once on the client-side.

// We use module-level variables to act as a singleton.
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Initializes and/or returns the Firebase services singleton.
 * This function is safe to call multiple times and will only initialize once.
 * It is designed to be called ONLY on the client-side.
 */
export function getFirebase() {
  // If we're on the server, return nulls immediately. This is the crucial safeguard.
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // If the app is already initialized, return the existing instances.
  if (firebaseApp) {
    return { firebaseApp, auth, firestore };
  }

  // Check if Firebase config is available.
  // This check now happens safely on the client.
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
  ) {
    // We log the error but don't throw, allowing the app to continue
    // running. Auth-gated pages will handle the lack of services.
    console.error("Firebase configuration is missing or incomplete. Please check your environment variables.");
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Initialize the Firebase app if it hasn't been already.
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp(); // Or get the existing app if it was somehow initialized elsewhere.
  }
  
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}
