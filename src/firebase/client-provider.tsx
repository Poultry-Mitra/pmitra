'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebase } from '@/firebase/client';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // By moving the getFirebase() call inside useMemo, we ensure it only runs
  // on the client-side after the component has mounted.
  // The server-side render will return nulls, which the FirebaseProvider handles gracefully.
  const firebaseServices = useMemo(() => getFirebase(), []);

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
