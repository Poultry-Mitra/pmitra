
// src/app/app-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User as FirebaseAuthUser, getAuth } from 'firebase/auth';
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

const PUBLIC_PATHS = ['/login', '/signup', '/blog', '/privacy', '/terms'];

const getRedirectPath = (role?: UserRole | null) => {
  if (!role) return '/login';
  return {
    farmer: '/dashboard',
    dealer: '/dealer/dashboard',
    admin: '/admin/dashboard',
  }[role] || '/login';
};

const getRoleFromPath = (path: string): UserRole | 'public' | 'root' | 'none' => {
  if (path === '/') return 'root';
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) return 'public';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/dealer')) return 'dealer';
  if (['/dashboard', '/batches', '/ledger', '/inventory', '/dealers', '/chat', '/monitoring', '/analytics', '/feed-recommendation', '/daily-rates', '/pricing', '/profile', '/biosecurity'].some(p => path.startsWith(p))) {
    return 'farmer';
  }
  return 'none';
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
          // Special case for admin role that might not be in 'users' collection.
          // This check ensures the admin can log in even without a user document.
          const auth = getAuth();
          if(auth.currentUser?.email === 'ipoultrymitra@gmail.com') {
             setAppUser({ id: firebaseUser.uid, email: 'ipoultrymitra@gmail.com', role: 'admin', name: 'Admin', status: 'Active', dateJoined: new Date().toISOString() } as User);
          } else {
             setAppUser(null);
          }
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

  // Combined loading state. True if either auth or profile is loading.
  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    // Wait until loading is complete before running any redirection logic.
    if (isLoading) return;

    const requiredRole = getRoleFromPath(pathname);
    
    // Allow access to public pages and the root landing page for everyone, regardless of login state.
    if (requiredRole === 'public' || requiredRole === 'root' || requiredRole === 'none') {
        return;
    }

    // If user is not logged in and tries to access a protected route
    if (!appUser) {
        router.replace(`/login?redirect=${pathname}`);
        return;
    }

    // If there's a role mismatch (e.g., a farmer trying to access /admin)
    if (appUser.role !== requiredRole) {
        router.replace(getRedirectPath(appUser.role));
    }

  }, [appUser, isLoading, pathname, router]);

  const value = { user: appUser, loading: isLoading };
  
  const requiredRole = getRoleFromPath(pathname);

  // Show a global loader for protected routes while we're still authenticating
  // This prevents a flicker of content before redirection.
  if (isLoading && requiredRole !== 'public' && requiredRole !== 'root' && requiredRole !== 'none') {
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
