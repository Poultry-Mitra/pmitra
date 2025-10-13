'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebase } from '@/firebase/client'; // Import from the new client file
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // By moving the getFirebase() call inside useMemo, we ensure it only runs
  // on the client-side after the component has mounted.
  // The server-side render will not execute this.
  const firebaseServices = useMemo(() => getFirebase(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp!}
      auth={firebaseServices.auth!}
      firestore={firebaseServices.firestore!}
    >
      {children}
    </FirebaseProvider>
  );
}
