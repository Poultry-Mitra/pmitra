// src/app/app-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User, UserRole } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AppUserContextType {
  user: User | null;
  loading: boolean;
}

const AppUserContext = createContext<AppUserContextType | undefined>(undefined);

export function useAppUser() {
  const context = useContext(AppUserContext);
  if (!context) {
    throw new Error('useAppUser must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
  allowedRoles?: UserRole[] | 'public';
}

const getRedirectPath = (role: UserRole) => {
  return {
    farmer: '/dashboard',
    dealer: '/dealer/dashboard',
    admin: '/admin/dashboard',
  }[role] || '/login';
};

export function AppProvider({ children, allowedRoles = [] }: AppProviderProps) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      setLoading(true);
      return;
    }

    if (!firebaseUser) {
        if (allowedRoles === 'public') {
            setLoading(false);
            setAppUser(null);
        } else {
            router.replace(`/login?redirect=${pathname}`);
        }
        return;
    }

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = { id: docSnap.id, ...docSnap.data() } as User;
        setAppUser(userData);

        if (allowedRoles !== 'public') {
          if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
            router.replace(getRedirectPath(userData.role));
          } else {
            setLoading(false);
          }
        } else {
            setLoading(false);
        }

      } else {
        // User exists in Auth but not in Firestore, something is wrong.
        console.error("User profile not found in Firestore for UID:", firebaseUser.uid);
        setAppUser(null);
        if (allowedRoles !== 'public') {
            router.replace('/login');
        } else {
            setLoading(false);
        }
      }
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
        if (allowedRoles !== 'public') {
            router.replace('/login');
        }
    });

    return () => unsubscribe();
  }, [isUserLoading, firebaseUser, firestore, router, pathname, allowedRoles]);

  const value = { user: appUser, loading };

  if (loading && allowedRoles !== 'public') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <AppUserContext.Provider value={value}>
      {children}
    </AppUserContext.Provider>
  );
}