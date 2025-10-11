
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <AppSidebar collapsible="icon" />
        <SidebarRail />
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
