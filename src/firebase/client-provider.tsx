'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebase } from '@/firebase/client'; // Import from the new client file

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // By moving the getFirebase() call inside useMemo, we ensure it only runs
  // on the client-side after the component has mounted.
  // The server-side render will not execute this.
  const firebaseServices = useMemo(() => getFirebase(), []);

  // Safely render children only when Firebase services are fully available.
  // On the server or during initial client render before Firebase is ready,
  // this will prevent child components from trying to use null services.
  if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    // You can return a global loader here if you want.
    // Returning null is also safe as it prevents rendering of children that depend on Firebase.
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
