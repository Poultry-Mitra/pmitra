

"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/header";
import { AppProvider } from "@/app/app-provider";
import { usePathname, useRouter } from "next/navigation";
import { useAppUser } from "@/app/app-provider";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function AuthWall({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAppUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.replace(`/login?redirect=${pathname}`);
        }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return <>{children}</>;
}


export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
      <AppProvider>
        <AuthWall>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <AppHeader />
                    <main className="p-4 sm:px-6 sm:py-8">
                    {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </AuthWall>
      </AppProvider>
  );
}
