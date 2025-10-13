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

  // The check to return null is removed. 
  // We will always render the children, and the individual providers/pages 
  // (like AppProvider) will handle their own loading states if they depend on Firebase.
  // This ensures that public pages which don't need Firebase can render immediately.
  
  // We pass potentially null services to the provider. The hooks (useAuth, etc.) 
  // are designed to handle this gracefully.
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
