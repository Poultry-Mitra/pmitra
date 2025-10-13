
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DealerSidebar } from "./_components/sidebar";
import { DealerHeader } from "./_components/header";
import { AppProvider } from "../app-provider";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider allowedRoles={['dealer']}>
      <SidebarProvider>
          <DealerSidebar />
          <SidebarInset>
            <DealerHeader />
            <main className="p-4 sm:px-6 sm:py-8">
              {children}
            </main>
          </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
