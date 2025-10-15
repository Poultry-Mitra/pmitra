"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { AppIcon } from "@/app/icon-component";
import {
  LayoutGrid,
  Users,
  Bot,
  Settings,
  LogOut,
  TrendingUp,
  Bell,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useAppUser } from "@/app/app-provider";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const [managementOpen, setManagementOpen] = useState(pathname.startsWith("/admin/user-management"));
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/admin/settings"));

  const { user: currentUser, loading } = useAppUser();


  if (loading || !currentUser || currentUser.role !== 'admin') {
      return (
          <Sidebar>
              <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <AppIcon className="size-8 text-primary" />
                        {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
                    </div>
              </SidebarHeader>
              <SidebarContent>
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
              </SidebarContent>
              <SidebarFooter />
          </Sidebar>
      );
  }

  return (
    <>
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
                    <SidebarMenuButton isActive={pathname === "/admin/dashboard"} tooltip={t('admin.dashboard.title')}>
                    <LayoutGrid />
                    <span>{t('admin.dashboard.title')}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/admin/transactions">
                    <SidebarMenuButton isActive={pathname.startsWith("/admin/transactions")} tooltip={t('admin.transactions')}>
                    <CreditCard />
                    <span>{t('admin.transactions')}</span>
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
                            <SidebarMenuButton tooltip={t('admin.users.title_management')} className="w-full justify-between pr-8" isActive={pathname.startsWith("/admin/user-management")}>
                                <div className="flex items-center gap-3">
                                    <Users />
                                    <span>{t('admin.users.title_management')}</span>
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
                                    {t('admin.farmers_page.title')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/user-management/dealers">
                                    <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/dealers"}>
                                    {t('admin.dealers_page.title')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/user-management/add-user">
                                    <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/add-user"}>
                                    {t('admin.users.add_user_button')}
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
                <Link href="/admin/chat-logs">
                    <SidebarMenuButton isActive={pathname.startsWith("/admin/chat-logs")} tooltip={t('admin.ai_chat_logs')}>
                    <Bot />
                    <span>{t('admin.ai_chat_logs')}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/admin/notifications">
                    <SidebarMenuButton isActive={pathname.startsWith("/admin/notifications")} tooltip={t('admin.notifications')}>
                    <Bell />
                    <span>{t('admin.notifications')}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            </SidebarMenu>
             <SidebarSeparator />
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarMenu>
                 <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <SidebarMenuItem className="relative">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={t('admin.app_settings')} className="w-full justify-between pr-8" isActive={pathname.startsWith("/admin/settings")}>
                                <div className="flex items-center gap-3">
                                    <Settings />
                                    <span>{t('admin.app_settings')}</span>
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
                                    {t('admin.app_settings')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/settings/pricing">
                                    <SidebarMenuButton size="sm" isActive={pathname === "/admin/settings/pricing"}>
                                    {t('admin.pricing_plans')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/settings/payments">
                                    <SidebarMenuButton size="sm" isActive={pathname === "/admin/settings/payments"}>
                                    {t('admin.payment_gateways')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/admin/settings/promo-codes">
                                    <SidebarMenuButton size="sm" isActive={pathname === "/admin/settings/promo-codes"}>
                                    {t('admin.promo_codes')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenu>

        </SidebarContent>
        <SidebarFooter>
           {/* Footer is now empty, logout is in the header dropdown */}
        </SidebarFooter>
        </Sidebar>
    </>
  );
}
