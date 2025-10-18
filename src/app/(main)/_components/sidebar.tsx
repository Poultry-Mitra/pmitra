

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
import { AppIcon } from "@/app/icon-component";
import {
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  FileText,
  Users,
  Rocket,
  Archive,
  BookText,
  ChevronDown,
  ChevronUp,
  WandSparkles,
  Loader2,
  User as UserIcon,
  AreaChart,
  Signal,
  Heart,
  Wrench,
  Warehouse,
  ShoppingBag,
  CreditCard,
  Calculator,
  Droplet,
  LineChart as LineChartIcon,
  Egg,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { useAppUser } from "@/app/app-provider";

const farmerNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "dashboard.title" },
  { href: "/batches", icon: FileText, label: "batches.title" },
  { href: "/ledger", icon: BookText, label: "ledger.title" },
];

const farmerConnectNavItems = [
  { href: "/dealers", icon: Users, label: "dealers.title" },
];

const farmerAiNavItems = [
    { href: "/chat", icon: MessageSquare, label: "ai_chat.title" },
    { href: "/analytics", icon: AreaChart, label: "analytics.title" },
    { href: "/monitoring", icon: Signal, label: "monitoring.title" },
    { href: "/diagnose-health", icon: Heart, label: "diagnose_health.title" },
    { href: "/biosecurity", icon: ShieldCheck, label: "biosecurity.title" },
    { href: "/feed-recommendation", icon: WandSparkles, label: "feed_ai.title"},
];

const dealerNavItems = [
    { href: "/dealer/dashboard", icon: LayoutDashboard, label: "dealer.dashboard" },
    { href: "/dealer/my-inventory", icon: Warehouse, label: "dealer.my_inventory" },
    { href: "/dealer/my-farmers", icon: Users, label: "dealer.my_farmers" },
    { href: "/dealer/my-orders", icon: ShoppingBag, label: "dealer.farmer_orders" },
    { href: "/dealer/transactions", icon: CreditCard, label: "dealer.ledger" },
];

const publicTools = [
  { href: "/tools/broiler-calculator", icon: Calculator, label: "Broiler Calculator" },
  { href: "/tools/fcr-calculator", icon: Droplet, label: "FCR Calculator" },
  { href: "/tools/feed-comparison", icon: LineChartIcon, label: "Feed Comparison" },
  { href: "/tools/layer-feed-consumption", icon: Egg, label: "Layer Feed Calc" },
  { href: "/tools/per-egg-cost", icon: Egg, label: "Per Egg Cost Calc" },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const { user, loading } = useAppUser();
  const [inventoryOpen, setInventoryOpen] = useState(pathname.startsWith('/inventory'));
  const [toolsOpen, setToolsOpen] = useState(pathname.startsWith('/tools'));

  if (loading || !user) {
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
  
  const isFarmer = user.role === 'farmer';
  const isDealer = user.role === 'dealer';

  // Fallback for older user documents that might not have poultryMitraId
  const displayId = user.poultryMitraId || user.uniqueDealerCode || `PM-USER-${user.id.substring(0, 5).toUpperCase()}`;
  const planType = user.planType || 'free';

  return (
    <>
        <Sidebar>
        <SidebarHeader>
            <div className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-2">
                    <AppIcon className="size-8 text-primary" />
                    <span className="group-data-[state=collapsed]:hidden font-headline text-lg font-bold">PoultryMitra</span>
                </div>
                <div className="group-data-[state=collapsed]:hidden rounded-lg border bg-card p-3 text-sm">
                    <div className="flex items-start gap-2">
                        <Avatar className="size-10">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-bold">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{displayId}</div>
                        </div>
                    </div>
                    <Badge className="mt-2 w-full justify-center capitalize" variant={planType === 'premium' ? 'default' : 'secondary'}>{t(`plans.${planType}`)}</Badge>
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent>
            {isFarmer && (
                <>
                    <SidebarGroupLabel>{t('sidebar.main')}</SidebarGroupLabel>
                    <SidebarMenu>
                    {farmerNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton
                            isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true)}
                            tooltip={t(item.label)}
                            >
                            <item.icon />
                            <span>{t(item.label)}</span>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                    
                    <SidebarSeparator />
                    <SidebarGroupLabel>{t('sidebar.inventory_dealers')}</SidebarGroupLabel>
                    <SidebarMenu>
                    <Collapsible open={inventoryOpen} onOpenChange={setInventoryOpen}>
                        <SidebarMenuItem className="relative">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={t('inventory.title')} className="w-full justify-between pr-8" isActive={pathname.startsWith("/inventory")}>
                                <div className="flex items-center gap-3">
                                    <Archive />
                                    <span>{t('inventory.title')}</span>
                                </div>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 group-data-[state=collapsed]:hidden">
                            {inventoryOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                        </SidebarMenuItem>

                        <CollapsibleContent>
                            <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                                <SidebarMenuItem>
                                    <Link href="/inventory">
                                        <SidebarMenuButton size="sm" isActive={pathname === "/inventory"}>
                                        {t('inventory.view_stock')}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <Link href="/inventory/add">
                                        <SidebarMenuButton size="sm" isActive={pathname === "/inventory/add"}>
                                        {t('inventory.add_purchase')}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </CollapsibleContent>
                    </Collapsible>
                    {farmerConnectNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={t(item.label)}
                            >
                            <item.icon />
                            <span>{t(item.label)}</span>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>

                    <SidebarSeparator />
                    <SidebarGroupLabel>{t('sidebar.ai_analytics')}</SidebarGroupLabel>
                    <SidebarMenu>
                        {farmerAiNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={t(item.label)}
                            >
                            <item.icon />
                            <span>{t(item.label)}</span>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </>
            )}
            
            {isDealer && (
                 <SidebarMenu>
                    {dealerNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton
                            isActive={pathname.startsWith(item.href) && (item.href === '/dealer/dashboard' ? pathname === item.href : true)}
                            tooltip={t(item.label)}
                            >
                            <item.icon />
                            <span>{t(item.label)}</span>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem>
                    ))}
                 </SidebarMenu>
            )}

            <SidebarSeparator />
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                    <SidebarMenuItem className="relative">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Calculators & Tools" className="w-full justify-between pr-8" isActive={pathname.startsWith("/tools")}>
                            <div className="flex items-center gap-3">
                                <Wrench />
                                <span>Tools</span>
                            </div>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 group-data-[state=collapsed]:hidden">
                        {toolsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                    </SidebarMenuItem>

                    <CollapsibleContent>
                        <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                            {publicTools.map((tool) => (
                                <SidebarMenuItem key={tool.href}>
                                    <Link href={tool.href}>
                                        <SidebarMenuButton size="sm" isActive={pathname === tool.href}>
                                        {tool.label}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenu>
            
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/profile">
                        <SidebarMenuButton tooltip={t('profile.title')} isActive={pathname === '/profile'}>
                            <UserIcon />
                            <span>{t('profile.title')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                {planType !== 'premium' && (
                    <SidebarMenuItem>
                        <Link href="/pricing">
                            <SidebarMenuButton tooltip={t('pricing.upgrade_plan')}>
                                <Rocket/>
                                <span>{t('pricing.upgrade_plan')}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarFooter>
        </Sidebar>
    </>
  );
}
