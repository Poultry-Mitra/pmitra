
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!firebaseUser) {
        if (!allowedRoles.includes('public')) {
            router.replace('/login');
        } else {
            setLoading(false);
        }
        return;
    }
    
    const userDocRef = doc(firestore!, 'users', firebaseUser.uid);
    let attempts = 0;
    const maxAttempts = 5;
    const delay = 300;

    const fetchUserProfile = () => {
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const userData = { id: docSnap.id, ...docSnap.data() } as AppUser;
                setAppUser(userData);

                if (allowedRoles.includes('public')) {
                    router.replace(getRedirectPath(userData.role));
                    return;
                }

                if (!allowedRoles.includes(userData.role)) {
                    console.warn(`Role mismatch: User is '${userData.role}', but this layout requires one of [${allowedRoles.join(', ')}]. Redirecting.`);
                    router.replace(getRedirectPath(userData.role));
                } else {
                    setLoading(false);
                }
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(fetchUserProfile, delay);
                } else {
                    // After several attempts, assume there's a real issue.
                    console.warn("User profile not found in Firestore after multiple attempts. Redirecting to login.");
                    router.replace('/login');
                }
            }
        }).catch(error => {
            console.error("Error fetching user profile:", error);
            router.replace('/login');
        });
    }

    fetchUserProfile();

  }, [isAuthLoading, firebaseUser, firestore, router, allowedRoles]);

  if (loading && !allowedRoles.includes('public')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user: appUser, loading }}>
      {children}
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
