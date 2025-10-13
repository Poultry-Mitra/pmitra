
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { User as AppUser, UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AppContextType {
  user: AppUser | null;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getRedirectPath = (role: UserRole) => {
  return {
    farmer: '/dashboard',
    dealer: '/dealer/dashboard',
    admin: '/admin/dashboard',
  }[role] || '/login';
};

export function AppProvider({ children, allowedRoles }: { children: ReactNode; allowedRoles: (UserRole | 'public')[] }) {
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'redirecting'>('loading');

  useEffect(() => {
    // If it's a public page, no auth checks needed. Render immediately.
    if (allowedRoles.includes('public')) {
      // If a logged-in user tries to access a public-only page (e.g., /login), redirect them.
      if (firebaseUser && firestore) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as AppUser;
            router.replace(getRedirectPath(userData.role));
          } else {
            // User exists in auth but not in firestore, treat as logged out for public page
            setAppUser(null);
            setStatus('success');
          }
        }).catch(() => {
            // Error fetching doc, treat as logged out
            setAppUser(null);
            setStatus('success');
        });
      } else {
        setAppUser(null);
        setStatus('success');
      }
      return;
    }

    // For protected pages:
    if (isAuthLoading) {
      setStatus('loading');
      return;
    }

    if (!firebaseUser) {
      setStatus('redirecting');
      router.replace(`/login?redirect=${pathname}`);
      return;
    }

    if (!firestore) return;

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    let attempts = 0;
    const maxAttempts = 5;
    const delay = 300;

    const fetchUserProfile = () => {
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() } as AppUser;
          setAppUser(userData);

          if (!allowedRoles.includes(userData.role)) {
            console.warn(`Role mismatch: User is '${userData.role}', but this layout requires one of [${allowedRoles.join(', ')}]. Redirecting.`);
            setStatus('redirecting');
            router.replace(getRedirectPath(userData.role));
          } else {
            setStatus('success');
          }
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(fetchUserProfile, delay);
          } else {
            console.error("User profile not found in Firestore after multiple attempts. Logging out.");
            setStatus('redirecting');
            router.replace('/login');
          }
        }
      }).catch(error => {
        console.error("Error fetching user profile:", error);
        setStatus('redirecting');
        router.replace('/login');
      });
    };

    fetchUserProfile();

  }, [isAuthLoading, firebaseUser, firestore, router, pathname, allowedRoles]);

  if (status !== 'success') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user: appUser, loading: status !== 'success' }}>
      {status === 'success' ? children : null}
    </AppContext.Provider>
  );
}

export function useAppUser() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppUser must be used within an AppProvider');
  }
  return context;
}
