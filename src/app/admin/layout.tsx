

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout is wrapped in FirebaseClientProvider, so hooks are available.
  // The child components like AdminHeader and AdminSidebar will handle their own data fetching.
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
