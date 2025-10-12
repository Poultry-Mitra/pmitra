

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
} from "@/components/ui/sidebar";
import { AppIcon } from "@/app/icon";
import {
  LayoutDashboard,
  MessageSquare,
  Landmark,
  ShieldCheck,
  LogOut,
  Settings,
  TrendingUp,
  FileText,
  Users,
  Rocket,
  WandSparkles,
  Archive,
  BookText,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentUser } from "@/lib/data";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/batches", icon: FileText, label: "My Batches" },
  { href: "/inventory", icon: Archive, label: "Inventory" },
  { href: "/ledger", icon: BookText, label: "Ledger" },
  { href: "/dealers", icon: Users, label: "Dealers" },
];

const aiNavItems = [
    { href: "/chat", icon: MessageSquare, label: "AI Chat" },
    { href: "/feed-recommendation", icon: WandSparkles, label: "Feed AI" },
    { href: "/monitoring", icon: ShieldCheck, label: "Monitoring" },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const user = currentUser;
  const poultryMitraId = `PM-FARM-${user.id.substring(0, 5).toUpperCase()}`;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full flex-col gap-4">
           <div className="flex items-center gap-2">
                <AppIcon className="size-8 text-primary" />
                {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
            </div>
            {state === 'expanded' && (
                <div className="rounded-lg border bg-card p-3 text-sm">
                    <div className="flex items-start gap-2">
                        <Avatar className="size-10">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-bold">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{poultryMitraId}</div>
                        </div>
                    </div>
                     <Badge className="mt-2 w-full justify-center">Premium Plan</Badge>
                </div>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarMenu>
             {aiNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>


        <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/analytics">
                    <SidebarMenuButton
                         isActive={pathname.startsWith("/analytics")}
                         tooltip="Analytics"
                    >
                        <TrendingUp/>
                        <span>Analytics</span>
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/daily-rates">
                    <SidebarMenuButton
                        isActive={pathname.startsWith("/daily-rates")}
                        tooltip="Market Rates"
                    >
                        <TrendingUp/>
                        <span>Market Rates</span>
                        {state === 'expanded' && <Badge variant="secondary" className="ml-auto">PRO</Badge>}
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/pricing">
                    <SidebarMenuButton tooltip="Upgrade">
                        <Rocket/>
                        <span>Upgrade Plan</span>
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <SidebarMenuButton tooltip="Settings">
                    <Settings/>
                    <span>{t('sidebar_settings')}</span>
                </SidebarMenuButton>
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
