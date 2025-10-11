
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <AdminSidebar />
        <SidebarRail />
        <SidebarInset>
          <AdminHeader />
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
