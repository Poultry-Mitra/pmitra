
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { AppIcon } from "@/app/icon";
import {
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Settings,
  TrendingUp,
  FileText,
  Users,
  Rocket,
  Archive,
  BookText,
  ChevronDown,
  ChevronUp,
  WandSparkles,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { useUser, useFirestore } from "@/firebase/provider";
import { doc, getDoc } from 'firebase/firestore';

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/batches", icon: FileText, label: "My Batches" },
  { href: "/ledger", icon: BookText, label: "Ledger" },
];

const connectNavItems = [
  { href: "/dealers", icon: Users, label: "Dealers" },
];

const aiNavItems = [
    { href: "/chat", icon: MessageSquare, label: "AI Chat" },
    { href: "/monitoring", icon: ShieldCheck, label: "Monitoring" },
    { href: "/analytics", icon: TrendingUp, label: "Analytics"},
    { href: "/feed-recommendation", icon: WandSparkles, label: "Feed AI"},
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const firebaseUser = useUser();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (firebaseUser && firestore) {
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() } as User);
        }
      });
    } else {
      setUser(null);
    }
  }, [firebaseUser, firestore]);
  
  const [inventoryOpen, setInventoryOpen] = useState(pathname.startsWith('/inventory'));

  if (!user || !firebaseUser) {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
  }

  const poultryMitraId = `PM-FARM-${firebaseUser.uid.substring(0, 5).toUpperCase()}`;
  const planName = user.planType === 'premium' ? 'Premium Plan' : 'Free Plan';

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
                     <Badge className="mt-2 w-full justify-center capitalize" variant={user.planType === 'premium' ? 'default' : 'secondary'}>{planName}</Badge>
                </div>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>

        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarSeparator />
        <SidebarGroupLabel>Inventory & Dealers</SidebarGroupLabel>
        <SidebarMenu>
           <Collapsible open={inventoryOpen} onOpenChange={setInventoryOpen}>
            <SidebarMenuItem className="relative">
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Inventory" className="w-full justify-between pr-8" isActive={pathname.startsWith("/inventory")}>
                      <div className="flex items-center gap-3">
                          <Archive />
                          <span>Inventory</span>
                      </div>
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              { state === 'expanded' && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {inventoryOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </div>
              )}
            </SidebarMenuItem>

            <CollapsibleContent>
                 <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                    <SidebarMenuItem>
                        <Link href="/inventory">
                            <SidebarMenuButton size="sm" isActive={pathname === "/inventory"}>
                            View Stock
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/inventory/add">
                            <SidebarMenuButton size="sm" isActive={pathname === "/inventory/add"}>
                            Add Purchase
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
          {connectNavItems.map((item) => (
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

        <SidebarSeparator />
        <SidebarGroupLabel>AI & Analytics</SidebarGroupLabel>
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
        
        <SidebarSeparator />
        <SidebarGroupLabel>Market</SidebarGroupLabel>
        <SidebarMenu>
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

    