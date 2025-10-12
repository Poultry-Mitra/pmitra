

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";
import { useUser } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import type { User as AppUser } from "@/lib/types";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout is wrapped in FirebaseClientProvider, so hooks are available
  // However, we need a client component to use them. Let's create a wrapper.

  return (
    <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="p-4 sm:px-6 sm:py-8">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
