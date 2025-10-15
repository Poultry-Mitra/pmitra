
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DealerSidebar } from "./_components/sidebar";
import { DealerHeader } from "./_components/header";
import { useAppUser } from "../app-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'dealer') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'dealer') {
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
