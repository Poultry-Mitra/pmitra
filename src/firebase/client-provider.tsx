// src/firebase/client-provider.tsx
'use client';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';

// This is a client-only wrapper that ensures Firebase is initialized only once.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider {...initializeFirebase()}>{children}</FirebaseProvider>;
}
