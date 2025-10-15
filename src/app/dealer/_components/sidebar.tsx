

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


export function DealerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const { user: currentUser, loading: userLoading } = useAppUser();
  const [showInventoryGuide, setShowInventoryGuide] = useState(false);

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
                    <Link href="/dealer/suppliers">
                        <SidebarMenuButton isActive={pathname.startsWith("/dealer/suppliers")} tooltip={t('dealer.suppliers')}>
                        <Truck />
                        <span>{t('dealer.suppliers')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dealer/my-inventory" onClick={handleInventoryClick}>
                        <SidebarMenuButton isActive={pathname.startsWith("/dealer/my-inventory")} tooltip={t('dealer.my_inventory')}>
                        <Warehouse />
                        <span>{t('dealer.my_inventory')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dealer/my-farmers">
                        <SidebarMenuButton isActive={pathname.startsWith("/dealer/my-farmers")} tooltip={t('dealer.my_farmers')}>
                        <Users />
                        <span>{t('dealer.my_farmers')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dealer/my-orders">
                        <SidebarMenuButton isActive={pathname.startsWith("/dealer/my-orders")} tooltip={t('dealer.farmer_orders')}>
                        <ShoppingBag />
                        <span>{t('dealer.farmer_orders')}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
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
            <SidebarGroupLabel>AI & Analytics</SidebarGroupLabel>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/dealer/chat">
                        <SidebarMenuButton isActive={pathname === "/dealer/chat"} tooltip={t('dealer.chat')}>
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
                 <SidebarMenuItem>
                    <Link href="/dealer/daily-rates">
                        <SidebarMenuButton isActive={pathname === "/dealer/daily-rates"} tooltip={t('dealer.market_rates')}>
                        <TrendingUp />
                        <span>{t('dealer.market_rates')}</span>
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
