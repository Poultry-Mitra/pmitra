
"use client";

import { useUser, useFirestore } from "@/firebase/provider";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";
import { FirebaseClientProvider } from "@/firebase/client-provider";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            setIsAuthorized(true);
          } else {
            // If user is not an admin, redirect them
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
    <FirebaseClientProvider>
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
            <AdminHeader />
            <main className="p-4 sm:px-6 sm:py-8">
                {children}
            </main>
            </SidebarInset>
        </SidebarProvider>
    </FirebaseClientProvider>
  );
}
