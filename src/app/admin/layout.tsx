
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";
import { currentDealer } from "@/lib/data"; // Using dealer mock for now
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real app, this would be a server-side check for the user's role.
  // For now, we'll use the mock data.
  const user = currentDealer; 
  if (user.role !== 'admin') {
      // You can redirect to a 404 or an unauthorized page.
      // For simplicity, we'll just show a message.
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Unauthorized</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </div>
        </div>
      )
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
