// src/firebase/provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// --- Initialization ---

let firebaseApp: FirebaseApp;
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
}

const auth = typeof window !== 'undefined' ? getAuth(firebaseApp!) : ({} as Auth);
const firestore = typeof window !== 'undefined' ? getFirestore(firebaseApp!) : ({} as Firestore);

// --- Context Definitions ---

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

interface AuthContextType {
  user: User | null;
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
});

const AuthContext = createContext<AuthContextType>({
  user: null,
  isUserLoading: true,
});

// --- Provider Component ---

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setUserLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const firebaseContextValue: FirebaseContextType = {
    app: firebaseApp || null,
    auth: auth || null,
    firestore: firestore || null,
  };
  
  const authContextValue: AuthContextType = {
    user,
    isUserLoading,
  };

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    </FirebaseContext.Provider>
  );
}


// --- Hooks ---

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useUser = () => useContext(AuthContext);
