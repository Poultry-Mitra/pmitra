

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
  BarChart2,
  CreditCard,
  User,
  LogOut,
  TrendingUp,
  Warehouse,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { currentDealer } from "@/lib/data";
import { useClientState } from "@/hooks/use-client-state";
import type { User as UserType } from "@/lib/types";


export function DealerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();

  const currentUser = useClientState<UserType | undefined>(currentDealer);

  if (!currentUser) {
      return (
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-2">
                    <AppIcon className="size-8 text-primary" />
                    {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
                </div>
            </SidebarHeader>
            <SidebarContent />
            <SidebarFooter />
        </Sidebar>
      );
  }

  const isDealer = currentUser?.role === 'dealer';

  if (!isDealer) {
      return (
          <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-2">
                    <AppIcon className="size-8 text-primary" />
                    {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <p className="p-4 text-sm text-muted-foreground">Invalid user role for this dashboard.</p>
            </SidebarContent>
             <SidebarFooter />
          </Sidebar>
      )
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
          <SidebarSeparator />
          <SidebarGroupLabel>Tools & Insights</SidebarGroupLabel>
           <SidebarMenu>
              <SidebarMenuItem>
                  <Link href="/dealer/reports">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/reports")} tooltip={"Reports"}>
                      <BarChart2 />
                      <span>{"Reports"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <Link href="/dealer/chat-logs">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/chat-logs")} tooltip={"AI Chat"}>
                      <Bot />
                      <span>{"AI Chat"}</span>
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <Link href="/dealer/daily-rates">
                      <SidebarMenuButton isActive={pathname.startsWith("/dealer/daily-rates")} tooltip={"Daily Rates"}>
                      <TrendingUp />
                      <span>{"Daily Rates"}</span>
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
