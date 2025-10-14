// src/firebase/client.ts
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This guard ensures Firebase is only initialized on the client side.
let firebaseApp: FirebaseApp;
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    // Check for complete config before initializing
    if (
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
    ) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      console.error(
        'Firebase config is missing or incomplete. Firebase will not be initialized.'
      );
      // Create a dummy object to avoid hard crashes on server or if config is missing
      firebaseApp = {} as FirebaseApp; 
    }
  } else {
    firebaseApp = getApp();
  }
} else {
  // On the server, create a dummy object.
  firebaseApp = {} as FirebaseApp;
}

// Export the initialized services directly.
// If on server or config is missing, these will be based on the dummy app object,
// preventing crashes but failing gracefully if used.
const auth = typeof window !== 'undefined' && firebaseApp.options ? getAuth(firebaseApp) : ({} as Auth);
const firestore = typeof window !== 'undefined' && firebaseApp.options ? getFirestore(firebaseApp) : ({} as Firestore);

export { firebaseApp, auth, firestore };
