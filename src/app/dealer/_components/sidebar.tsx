

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
import { AppIcon } from "@/app/icon-component";
import {
  LayoutGrid,
  Users,
  CreditCard,
  User,
  LogOut,
  Warehouse,
  ShoppingBag,
  Loader2,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  LineChart,
  Rocket,
  PlusCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useDealerInventory } from "@/hooks/use-dealer-inventory";
import { useAppUser } from "@/app/app-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


export function DealerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const { user: currentUser, loading: userLoading } = useAppUser();
  const [showInventoryGuide, setShowInventoryGuide] = useState(false);
  const [procurementOpen, setProcurementOpen] = useState(pathname.startsWith('/dealer/suppliers') || pathname.startsWith('/dealer/my-inventory/add'));
  const [salesOpen, setSalesOpen] = useState(pathname.startsWith('/dealer/my-farmers') || pathname.startsWith('/dealer/my-orders'));

  const { inventory, loading: inventoryLoading } = useDealerInventory(currentUser?.id);

  const handleInventoryClick = (e: React.MouseEvent) => {
    if (!inventoryLoading && (!inventory || inventory.length === 0)) {
        e.preventDefault();
        setShowInventoryGuide(true);
    }
  };
  
  const isPremium = currentUser?.planType === 'premium';
  const loading = userLoading || !currentUser;

  if (loading) {
      return (
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-2">
                    <AppIcon className="size-8 text-primary" />
                    {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <div className="flex justify-center p-4">
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
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/dealer/dashboard">
                        <SidebarMenuButton isActive={pathname === "/dealer/dashboard"} tooltip={t('dealer.dashboard')}>
                        <LayoutGrid />
                        <span>{t('dealer.dashboard')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dealer/my-inventory" onClick={handleInventoryClick}>
                        <SidebarMenuButton isActive={pathname === "/dealer/my-inventory"} tooltip={t('dealer.my_inventory')}>
                        <Warehouse />
                        <span>{t('dealer.my_inventory')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>

                 {/* Purchases Group */}
                <Collapsible open={procurementOpen} onOpenChange={setProcurementOpen}>
                    <SidebarMenuItem className="relative">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Purchases" className="w-full justify-between pr-8" isActive={pathname.startsWith("/dealer/suppliers") || pathname.startsWith('/dealer/my-inventory/add')}>
                            <div className="flex items-center gap-3">
                                <ShoppingCart />
                                <span>Purchases</span>
                            </div>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                     { state === 'expanded' && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {procurementOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                    )}
                    </SidebarMenuItem>
                    <CollapsibleContent>
                        <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                            <SidebarMenuItem>
                                <Link href="/dealer/suppliers">
                                    <SidebarMenuButton size="sm" isActive={pathname.startsWith('/dealer/suppliers')}>
                                    {t('dealer.suppliers')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/dealer/my-inventory/add">
                                    <SidebarMenuButton size="sm" isActive={pathname.startsWith('/dealer/my-inventory/add')}>
                                    Add Purchase
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>

                 {/* Customers & Sales Group */}
                <Collapsible open={salesOpen} onOpenChange={setSalesOpen}>
                    <SidebarMenuItem className="relative">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Customers &amp; Sales" className="w-full justify-between pr-8" isActive={pathname.startsWith("/dealer/my-farmers") || pathname.startsWith('/dealer/my-orders')}>
                            <div className="flex items-center gap-3">
                                <Users />
                                <span>Customers &amp; Sales</span>
                            </div>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                     { state === 'expanded' && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {salesOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                    )}
                    </SidebarMenuItem>
                    <CollapsibleContent>
                        <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                            <SidebarMenuItem>
                                <Link href="/dealer/my-farmers">
                                    <SidebarMenuButton size="sm" isActive={pathname.startsWith('/dealer/my-farmers')}>
                                    {t('dealer.my_farmers')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/dealer/my-orders">
                                    <SidebarMenuButton size="sm" isActive={pathname.startsWith('/dealer/my-orders')}>
                                    {t('dealer.farmer_orders')}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>

                <SidebarMenuItem>
                    <Link href="/dealer/transactions">
                        <SidebarMenuButton isActive={pathname.startsWith("/dealer/transactions")} tooltip={t('dealer.ledger')}>
                        <CreditCard />
                        <span>{t('dealer.ledger')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>

             <SidebarSeparator />
            <SidebarGroupLabel>AI &amp; Analytics</SidebarGroupLabel>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/chat">
                        <SidebarMenuButton isActive={pathname === "/chat"} tooltip={t('dealer.chat')}>
                        <MessageSquare />
                        <span>{t('dealer.chat')}</span>
                         {!isPremium && <Badge variant="secondary" className="ml-auto group-data-[state=collapsed]:hidden">PRO</Badge>}
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dealer/analytics">
                        <SidebarMenuButton isActive={pathname === "/dealer/analytics"} tooltip={t('dealer.analytics')}>
                        <LineChart />
                        <span>{t('dealer.analytics')}</span>
                        {!isPremium && <Badge variant="secondary" className="ml-auto group-data-[state=collapsed]:hidden">PRO</Badge>}
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>


        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/dealer/settings">
                        <SidebarMenuButton isActive={pathname.startsWith("/dealer/settings")} tooltip={t('dealer.profile')}>
                            <User/>
                            <span>{t('dealer.profile')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 {!isPremium && (
                    <SidebarMenuItem>
                        <Link href="/pricing">
                            <SidebarMenuButton tooltip={t('pricing.upgrade_plan')}>
                                <Rocket/>
                                <span>{t('pricing.upgrade_plan')}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                )}
                {/* The logout button is in the header dropdown now */}
            </SidebarMenu>
        </SidebarFooter>
        </Sidebar>

        <AlertDialog open={showInventoryGuide} onOpenChange={setShowInventoryGuide}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <PlusCircle className="text-primary"/>
                        Let's Add Your First Purchase!
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        The first step to managing inventory is to record a purchase from one of your suppliers. This will automatically add items to your stock.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Link href="/dealer/my-inventory/add">Add Purchase</Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    
