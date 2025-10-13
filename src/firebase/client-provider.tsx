'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A client-only provider that ensures Firebase is initialized once.
 * It uses `useEffect` to guarantee initialization only happens on the client
 * after the initial render, preventing SSR issues.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
  }>({ firebaseApp: null, auth: null, firestore: null });

  // `useEffect` with an empty dependency array runs only once on the client-side.
  useEffect(() => {
    const firebaseServices = initializeFirebase();
    setServices(firebaseServices);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
