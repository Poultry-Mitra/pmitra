'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp, auth, firestore } from './client'; // Import the initialized services directly

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  isAuthLoading: boolean; // True while the auth service itself is initializing
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true); // True until the first onAuthStateChanged call
  const [userError, setUserError] = useState<Error | null>(null);

  // isAuthLoading is now simpler: it's true until the first user check completes.
  const isAuthLoading = isUserLoading;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { 
        setUser(firebaseUser);
        setIsUserLoading(false); // First auth check is complete
        setUserError(null);
      },
      (error) => { 
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUser(null);
        setIsUserLoading(false); // Auth check is complete, even on error
        setUserError(error);
      }
    );
    return () => unsubscribe(); 
  }, []);

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    isAuthLoading, // This will be true until user state is confirmed
    user,
    isUserLoading,
    userError,
  }), [isAuthLoading, user, isUserLoading, userError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useAuth = (): { auth: Auth; isLoading: boolean } => {
  const { auth, isAuthLoading } = useFirebase();
  return { auth, isLoading: isAuthLoading };
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

export const useUser = (): { user: User | null, isUserLoading: boolean, userError: Error | null } => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
