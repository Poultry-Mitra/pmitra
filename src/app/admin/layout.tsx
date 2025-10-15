
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";
import { useAppUser } from "../app-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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

    