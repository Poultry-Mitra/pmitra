
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar";
import { AdminHeader } from "./_components/header";
import { mockUsers } from "@/lib/data";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real app, this would be a server-side check for the user's role.
  // For now, we'll use the mock data to find the admin user.
  const user = mockUsers.find(u => u.role === 'admin'); 
  if (!user || user.role !== 'admin') {
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
