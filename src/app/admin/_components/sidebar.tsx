

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
  Settings,
  LogOut,
  TrendingUp,
  Bell,
  CreditCard,
  Tags,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { mockUsers } from "@/lib/data";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";
import { useClientState } from "@/hooks/use-client-state";
import type { User as UserType } from "@/lib/types";


export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const [managementOpen, setManagementOpen] = useState(pathname.startsWith("/admin/user-management"));
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/admin/settings"));

  const adminUser = mockUsers.find(u => u.role === 'admin');
  const currentUser = useClientState<UserType | undefined>(adminUser);

  if (!currentUser || currentUser.role !== 'admin') {
      return (
          <Sidebar>
              <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <AppIcon className="size-8 text-primary" />
                        {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
                    </div>
              </SidebarHeader>
              <SidebarContent>
                  {/* You can add skeleton loaders here if you want */}
              </SidebarContent>
              <SidebarFooter />
          </Sidebar>
      );
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <AppIcon className="size-8 text-primary" />
            {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>Analytics</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
              <Link href="/admin/dashboard">
                <SidebarMenuButton isActive={pathname === "/admin/dashboard"} tooltip={"Dashboard"}>
                  <LayoutGrid />
                  <span>{"Dashboard"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="/admin/transactions">
                <SidebarMenuButton isActive={pathname.startsWith("/admin/transactions")} tooltip={"Transactions"}>
                  <CreditCard />
                  <span>{"Transactions"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />
        
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarMenu>
            <Collapsible open={managementOpen} onOpenChange={setManagementOpen}>
                <SidebarMenuItem className="relative">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="User Management" className="w-full justify-between pr-8" isActive={pathname.startsWith("/admin/user-management")}>
                        <div className="flex items-center gap-3">
                            <Users />
                            <span>User Management</span>
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                { state === 'expanded' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {managementOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                )}
                </SidebarMenuItem>

                <CollapsibleContent>
                    <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                        <SidebarMenuItem>
                            <Link href="/admin/user-management/farmers">
                                <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/farmers"}>
                                Farmers List
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/admin/user-management/dealers">
                                <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/dealers"}>
                                Dealers List
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/admin/user-management/add-user">
                                <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/add-user"}>
                                Add New User
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenu>
        <SidebarSeparator />

        <SidebarGroupLabel>Content & AI</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/daily-rates">
                <SidebarMenuButton isActive={pathname.startsWith("/admin/daily-rates")} tooltip={"Daily Rates"}>
                  <TrendingUp />
                  <span>{"Daily Rates"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/chat-logs">
                <SidebarMenuButton isActive={pathname.startsWith("/admin/chat-logs")} tooltip={"AI Chat Logs"}>
                  <Bot />
                  <span>{"AI Chat Logs"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="/admin/notifications">
                <SidebarMenuButton isActive={pathname.startsWith("/admin/notifications")} tooltip={"Notifications"}>
                  <Bell />
                  <span>{"Notifications"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SidebarMenuItem className="relative">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Settings" className="w-full justify-between pr-8" isActive={pathname.startsWith("/admin/settings")}>
                        <div className="flex items-center gap-3">
                            <Settings />
                            <span>Settings</span>
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                { state === 'expanded' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {settingsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                )}
                </SidebarMenuItem>

                <CollapsibleContent>
                    <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                        <SidebarMenuItem>
                            <Link href="/admin/settings">
                                <SidebarMenuButton size="sm" isActive={pathname === "/admin/settings"}>
                                App Settings
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/admin/settings/pricing">
                                <SidebarMenuButton size="sm" isActive={pathname === "/admin/settings/pricing"}>
                                Pricing Plans
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <Link href="/admin/settings/promo-codes">
                                <SidebarMenuButton size="sm" isActive={pathname === "/admin/settings/promo-codes"}>
                                Promo Codes
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
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
