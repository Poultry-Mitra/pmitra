
"use client";

import { useUser, useFirestore } from "@/firebase/provider";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    if (firestore) {
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            if (userData.role === 'farmer') {
              setIsAuthorized(true);
            } else {
              // If not a farmer, redirect based on their actual role
              const targetPath = {
                  dealer: '/dealer',
                  admin: '/admin',
              }[userData.role] || '/login';
              router.replace(targetPath);
            }
          } else {
            // No user profile found
            router.replace("/login");
          }
        })
        .catch(() => router.replace("/login"));
    }
  }, [firebaseUser, isUserLoading, firestore, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 sm:px-6 sm:py-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
