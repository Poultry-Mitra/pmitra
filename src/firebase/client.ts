'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This file ensures Firebase is initialized only once on the client-side.

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Initializes and/or returns the Firebase services singleton.
 * This function is safe to call multiple times and will only initialize once.
 * It is designed to be called on both the client and server. On the server, it will return nulls.
 */
export function getFirebase() {
  // If on the server, return nulls to avoid initialization errors.
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // If on the client and not yet initialized, initialize.
  if (!getApps().length) {
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.authDomain ||
      !firebaseConfig.projectId
    ) {
      console.error("Firebase configuration is missing. Please check your environment variables.");
       return { firebaseApp: null, auth: null, firestore: null };
    }
    
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    // If already initialized, get the existing app instance.
    if (!firebaseApp) {
        firebaseApp = getApp();
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);
    }
  }
  
  return { firebaseApp, auth, firestore };
}
