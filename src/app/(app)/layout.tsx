
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 sm:px-6 sm:py-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
