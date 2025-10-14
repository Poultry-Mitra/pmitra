// src/firebase/provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
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
  const firebaseContextValue = useMemo(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }, []);

  const [authContextValue, setAuthContextValue] = useState<AuthContextType>({
    user: null,
    isUserLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseContextValue.auth, (user) => {
      setAuthContextValue({ user, isUserLoading: false });
    });
    return () => unsubscribe();
  }, [firebaseContextValue.auth]);

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      <AuthContext.Provider value={authContextValue}>
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

// Hook to memoize Firestore queries.
export const useMemoFirebase = <T>(
  factory: () => T | null,
  deps: React.DependencyList,
): T | null => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
