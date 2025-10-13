
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
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
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'redirecting'>('loading');

  useEffect(() => {
    // If auth state is still loading, wait.
    if (isAuthLoading) {
      setStatus('loading');
      return;
    }

    // If there's no Firebase user
    if (!firebaseUser) {
      if (!allowedRoles.includes('public')) {
        setStatus('redirecting');
        router.replace('/login');
      } else {
        // It's a public page, so we are done.
        setAppUser(null);
        setStatus('success');
      }
      return;
    }
    
    // If there is a Firebase user, fetch their profile.
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

          // If it's a public-only page (like /login) but user is logged in, redirect them away.
          if (allowedRoles.length === 1 && allowedRoles.includes('public')) {
            setStatus('redirecting');
            router.replace(getRedirectPath(userData.role));
            return;
          }

          // If the user's role is not allowed for this route, redirect them.
          if (!allowedRoles.includes(userData.role)) {
            console.warn(`Role mismatch: User is '${userData.role}', but this layout requires one of [${allowedRoles.join(', ')}]. Redirecting.`);
            setStatus('redirecting');
            router.replace(getRedirectPath(userData.role));
          } else {
            // Role is allowed, ready to show the page.
            setStatus('success');
          }
        } else {
          // Retry logic in case of replication delay
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
    }

    fetchUserProfile();

  }, [isAuthLoading, firebaseUser, firestore, router, allowedRoles]);

  // While loading or redirecting, show a spinner. This prevents child components from rendering prematurely.
  if (status !== 'success' && !allowedRoles.includes('public')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Once status is 'success', render the children with the context.
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
