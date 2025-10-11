
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { AppIcon } from "@/app/icon";
import {
  LayoutGrid,
  Users,
  Bot,
  BarChart2,
  CreditCard,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


const navItems = [
  { href: "/admin/dashboard", icon: LayoutGrid, label: "Dashboard" },
  // { href: "/admin/user-management", icon: Users, label: "User Management" },
  { href: "/admin/chat-logs", icon: Bot, label: "AI Chat Logs" },
  { href: "/admin/reports", icon: BarChart2, label: "Reports & Analytics" },
  { href: "/admin/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscription Management" },
  { href: "/admin/settings", icon: Settings, label: "System Settings" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const [userManagementOpen, setUserManagementOpen] = useState(false);


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

          <Collapsible open={userManagementOpen} onOpenChange={setUserManagementOpen}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="User Management" className="justify-between">
                  <div className="flex items-center gap-2">
                    <Users />
                    <span>User Management</span>
                  </div>
                  {userManagementOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>

            <CollapsibleContent>
              <SidebarMenuSub>
                <li>
                  <Link href="/admin/user-management/farmers">
                    <SidebarMenuSubButton isActive={pathname === "/admin/user-management/farmers"}>
                      Farmers List
                    </SidebarMenuSubButton>
                  </Link>
                </li>
                 <li>
                  <Link href="/admin/user-management/dealers">
                    <SidebarMenuSubButton isActive={pathname === "/admin/user-management/dealers"}>
                      Dealers List
                    </SidebarMenuSubButton>
                  </Link>
                </li>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
          
          <SidebarMenuItem>
              <Link href="/admin/chat-logs">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/chat-logs")}
                  tooltip={"AI Chat Logs"}
                >
                  <Bot />
                  <span>{"AI Chat Logs"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/reports">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/reports")}
                  tooltip={"Reports & Analytics"}
                >
                  <BarChart2 />
                  <span>{"Reports & Analytics"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/transactions">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/transactions")}
                  tooltip={"Transactions"}
                >
                  <CreditCard />
                  <span>{"Transactions"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/subscriptions">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/subscriptions")}
                  tooltip={"Subscription Management"}
                >
                  <CreditCard />
                  <span>Subscription Management</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          
          <SidebarSeparator />
          
           <SidebarMenuItem>
              <Link href="/admin/settings">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/settings")}
                  tooltip={"System Settings"}
                >
                  <Settings />
                  <span>System Settings</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>

           <SidebarMenuItem>
              <Link href="/admin/notifications">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/notifications")}
                  tooltip={"Notifications"}
                >
                  <Bell />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton tooltip="Profile">
                    <User/>
                    <span>{"Profile"}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/login">
                  <SidebarMenuButton tooltip="Logout">
                      <LogOut />
                      <span>{t('sidebar.logout')}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
