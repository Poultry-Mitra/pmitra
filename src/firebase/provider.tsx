// src/firebase/provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// --- Context Definitions ---

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

interface AuthContextType {
  user: User | null;
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Component ---

export function FirebaseProvider({ children }: { children: ReactNode }) {
  // Initialize Firebase app and services within the provider
  const [firebaseContext, setFirebaseContext] = useState<FirebaseContextType | null>(null);
  const [authContext, setAuthContext] = useState<AuthContextType>({ user: null, isUserLoading: true });

  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    setFirebaseContext({ app, auth, firestore });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthContext({ user, isUserLoading: false });
    });

    return () => unsubscribe();
  }, []);

  if (!firebaseContext) {
    // You can render a global loader here if you want
    return null;
  }

  return (
    <FirebaseContext.Provider value={firebaseContext}>
      <AuthContext.Provider value={authContext}>
        {children}
      </AuthContext.Provider>
    </FirebaseContext.Provider>
  );
}


// --- Hooks ---

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp => useFirebase().app;
export const useAuth = (): Auth => useFirebase().auth;
export const useFirestore = (): Firestore => useFirebase().firestore;

export const useUser = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return context;
};
