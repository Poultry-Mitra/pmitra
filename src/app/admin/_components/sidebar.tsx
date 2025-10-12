

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { AppIcon } from "@/app/icon";
import {
  LayoutGrid,
  Users,
  Bot,
  BarChart2,
  CreditCard,
  Settings,
  User,
  LogOut,
  Tags,
  TrendingUp,
  Warehouse,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { mockUsers, type User as UserType } from "@/lib/data";


export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();

  // This is a mock. In a real app, you'd get the current user from an auth context.
  const currentUser = mockUsers.find(u => u.role === 'dealer') as UserType & { role: 'admin' | 'dealer' };
  const isAdmin = currentUser?.role === 'admin';


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <AppIcon className="size-8 text-primary" />
            {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
              <Link href="/admin/dashboard">
                <SidebarMenuButton
                  isActive={pathname === "/admin/dashboard"}
                  tooltip={"Dashboard"}
                >
                  <LayoutGrid />
                  <span>{"Dashboard"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>

          <SidebarSeparator />
          
          <SidebarGroupLabel>{isAdmin ? "Management" : "My Business"}</SidebarGroupLabel>
          
           <SidebarMenuItem>
              <Link href="/admin/my-inventory">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/my-inventory")}
                  tooltip={"My Inventory"}
                >
                  <Warehouse />
                  <span>{"My Inventory"}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="/admin/my-farmers">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/my-farmers")}
                  tooltip={"My Farmers"}
                >
                  <Users />
                  <span>{"My Farmers"}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/my-orders">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/my-orders")}
                  tooltip={"Farmer Orders"}
                >
                  <ShoppingBag />
                  <span>{"Farmer Orders"}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/admin/transactions">
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/admin/transactions")}
                    tooltip={"Ledger"}
                  >
                    <CreditCard />
                    <span>{"Ledger"}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>

          <SidebarSeparator />
          <SidebarGroupLabel>Tools & Insights</SidebarGroupLabel>
           <SidebarMenuItem>
              <Link href="/admin/reports">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/reports")}
                  tooltip={"Reports"}
                >
                  <BarChart2 />
                  <span>{"Reports"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/chat-logs">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/chat-logs")}
                  tooltip={"AI Chat"}
                >
                  <Bot />
                  <span>{"AI Chat"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="/admin/daily-rates">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/daily-rates")}
                  tooltip={"Daily Rates"}
                >
                  <TrendingUp />
                  <span>{"Daily Rates"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/admin/settings">
                    <SidebarMenuButton 
                        tooltip="Profile"
                        isActive={pathname.startsWith("/admin/settings")}
                    >
                        <User/>
                        <span>{"Profile"}</span>
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/login">
                  <SidebarMenuButton tooltip="Logout">
                      <LogOut />
                      <span>{t('sidebar_logout')}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
