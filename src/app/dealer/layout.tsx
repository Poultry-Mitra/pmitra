
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DealerSidebar } from "./_components/sidebar";
import { DealerHeader } from "./_components/header";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
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
