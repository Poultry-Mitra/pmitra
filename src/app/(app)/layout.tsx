

"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/header";
import { AppProvider } from "@/app/app-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
      <AppProvider>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="p-4 sm:px-6 sm:py-8">
                {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
      </AppProvider>
  );
}
