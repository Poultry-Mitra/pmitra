'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebase } from '@/firebase/client';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A client-only provider that ensures Firebase is initialized once on the client-side.
 * It uses `useMemo` to call `getFirebase`, which is critical to prevent it from running
 * during server-side rendering, even inside a 'use client' component.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // `useMemo` ensures `getFirebase` is only called on the client-side after mount,
  // and only once. On the server, this will not execute, and `getFirebase` will
  // return nulls, which the FirebaseProvider is designed to handle gracefully.
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
