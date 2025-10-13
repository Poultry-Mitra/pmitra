
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";
import { AppProvider } from "../app-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider allowedRoles={['admin']}>
      <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
          <AdminHeader />
          <main className="p-4 sm:px-6 sm:py-8">
              {children}
          </main>
          </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
