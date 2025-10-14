// src/app/app-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User as FirebaseAuthUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase/provider';
import type { User, UserRole } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AppContextType {
  user: User | null;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppUser() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppUser must be used within an AppProvider');
  }
  return context;
}

const PUBLIC_PATHS = ['/login', '/signup', '/blog', '/privacy', '/terms', '/'];

const getRedirectPath = (role?: UserRole | null) => {
  if (!role) return '/login';
  return {
    farmer: '/dashboard',
    dealer: '/dealer/dashboard',
    admin: '/admin/dashboard',
  }[role] || '/login';
};

const getRoleFromPath = (path: string): UserRole | 'public' | 'none' => {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/dealer')) return 'dealer';
  if (path === '/dashboard' || path.startsWith('/batches') || path.startsWith('/ledger') || path.startsWith('/inventory') || path.startsWith('/dealers') || path.startsWith('/chat') || path.startsWith('/monitoring') || path.startsWith('/analytics') || path.startsWith('/feed-recommendation') || path.startsWith('/daily-rates') || path.startsWith('/pricing') || path.startsWith('/profile')) return 'farmer';
  if (PUBLIC_PATHS.some(p => path.startsWith(p) && p !== '/') || path === '/') return 'public';
  return 'none'; // For layouts or other non-page routes
};


export function AppProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthLoading) {
        setProfileLoading(true);
        return;
    }
    
    if (firebaseUser && firestore) {
      setProfileLoading(true);
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setAppUser({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          setAppUser(null);
        }
        setProfileLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setAppUser(null);
        setProfileLoading(false);
      });
      return () => unsubscribeFirestore();
    } else {
        setAppUser(null);
        setProfileLoading(false);
    }
  }, [firebaseUser, firestore, isAuthLoading]);

  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    if (isLoading) return;

    const requiredRole = getRoleFromPath(pathname);
    
    if (requiredRole === 'public' || requiredRole === 'none') {
        // No redirection needed for public paths or layout files
        return;
    }

    if (!appUser) {
        // Logged out user trying to access a protected route
        router.replace(`/login?redirect=${pathname}`);
        return;
    }

    if (requiredRole !== 'public' && appUser.role !== requiredRole) {
        // Logged in user with role mismatch
        router.replace(getRedirectPath(appUser.role));
    }

  }, [appUser, isLoading, pathname, router]);

  const value = { user: appUser, loading: isLoading };

  const requiredRole = getRoleFromPath(pathname);
  if (isLoading && requiredRole !== 'public' && requiredRole !== 'none') {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
