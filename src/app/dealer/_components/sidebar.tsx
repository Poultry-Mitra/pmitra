
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
  CreditCard,
  User,
  LogOut,
  Warehouse,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { User as UserType } from "@/lib/types";
import { useUser, useFirestore } from "@/firebase/provider";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";


export function DealerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

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
                      <SidebarMenuButton isActive={pathname === "/dealer/dashboard"} tooltip={"Dashboard"}>
                      <LayoutGrid />
                      <span>{"Dashboard"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                  <Link href="/dealer/my-inventory">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/my-inventory")} tooltip={"My Inventory"}>
                      <Warehouse />
                      <span>{"My Inventory"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                  <Link href="/dealer/my-farmers">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/my-farmers")} tooltip={"My Farmers"}>
                      <Users />
                      <span>{"My Farmers"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                  <Link href="/dealer/my-orders">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/my-orders")} tooltip={"Farmer Orders"}>
                      <ShoppingBag />
                      <span>{"Farmer Orders"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                  <Link href="/dealer/transactions">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/transactions")} tooltip={"Ledger"}>
                      <CreditCard />
                      <span>{"Ledger"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
          </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
          <SidebarMenu>
              <SidebarMenuItem>
                  <Link href="/dealer/settings">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/settings")} tooltip="Profile">
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
