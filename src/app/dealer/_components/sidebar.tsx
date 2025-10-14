

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
import type { User as UserType } from "@/lib/types";
import { useUser, useFirestore, useAuth } from "@/firebase/provider";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
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
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { useDealerInventory } from "@/hooks/use-dealer-inventory";


export function DealerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const { user: firebaseUser } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showInventoryGuide, setShowInventoryGuide] = useState(false);

  const { inventory, loading: inventoryLoading } = useDealerInventory(firebaseUser?.uid);

  useEffect(() => {
    if (firebaseUser && firestore) {
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().role === 'dealer') {
          setCurrentUser({ id: docSnap.id, ...docSnap.data() } as UserType);
        } else {
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    } else {
        setCurrentUser(null);
    }
  }, [firebaseUser, firestore]);
  
  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }
    setShowLogoutAlert(false);
  };

  const handleInventoryClick = (e: React.MouseEvent) => {
    if (!inventoryLoading && (!inventory || inventory.length === 0)) {
        e.preventDefault();
        setShowInventoryGuide(true);
    }
  };
  
  const isPremium = currentUser?.planType === 'premium';

  if (!currentUser) {
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
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={t('actions.logout')} onClick={() => setShowLogoutAlert(true)}>
                        <LogOut />
                        <span>{t('sidebar_logout')}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        </Sidebar>

        <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive"/>
                    {t('dialog.logout_title')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {t('dialog.logout_desc')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                     {t('actions.logout')}
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showInventoryGuide} onOpenChange={setShowInventoryGuide}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <PlusCircle className="text-primary"/>
                        Let's Add Your First Purchase!
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        The first step is to record a purchase from a supplier. This will automatically add items to your inventory.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Link href="/dealer/my-inventory/add">Add Purchase</Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
