
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DealerSidebar } from "./_components/sidebar";
import { DealerHeader } from "./_components/header";
import { useUser, useFirestore } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as AppUser, UserRole } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from "lucide-react";


const getRedirectPath = (role: UserRole) => {
  return {
    farmer: '/dashboard',
    dealer: '/dealer/dashboard',
    admin: '/admin/dashboard',
  }[role] || '/login';
};


export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const allowedRoles: UserRole[] = ['dealer'];

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!firebaseUser) {
      router.replace(`/login?redirect=${pathname}`);
      return;
    }

    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    getDoc(userDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as AppUser;
        if (allowedRoles.includes(userData.role)) {
          setIsAuthorized(true);
        } else {
          router.replace(getRedirectPath(userData.role));
        }
      } else {
        router.replace('/login');
      }
    });

  }, [isUserLoading, firebaseUser, firestore, router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
      <SidebarProvider>
          <DealerSidebar />
          <SidebarInset>
            <DealerHeader />
            <main className="p-4 sm:px-6 sm:py-8">
              {children}
            </main>
          </SidebarInset>
      </SidebarProvider>
  );
}
