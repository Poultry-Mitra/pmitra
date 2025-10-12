

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
  Settings,
  User,
  LogOut,
  Tags,
  TrendingUp,
  Warehouse,
  ShoppingBag,
  Bell,
  MessageSquare,
  ShieldQuestion,
  LifeBuoy,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { currentDealer } from "@/lib/data";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useClientState } from "@/hooks/use-client-state";
import type { User as UserType } from "@/lib/types";


export function DealerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const [managementOpen, setManagementOpen] = useState(pathname.startsWith("/dealer/user-management"));

  const currentUser = useClientState<UserType | undefined>(currentDealer);

  const isAdmin = currentUser?.role === 'admin';

  const renderLoadingSidebar = () => (
      <Sidebar>
          <SidebarHeader />
          <SidebarContent />
          <SidebarFooter />
      </Sidebar>
  );

  const renderDealerSidebar = () => (
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

  const renderAdminSidebar = () => (
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
              <Link href="/dealer/dashboard">
                <SidebarMenuButton isActive={pathname === "/dealer/dashboard"} tooltip={"Dashboard"}>
                  <LayoutGrid />
                  <span>{"Dashboard"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/dealer/reports">
                <SidebarMenuButton isActive={pathname.startsWith("/dealer/reports")} tooltip={"Reports"}>
                  <BarChart2 />
                  <span>{"Reports"}</span>
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
                    <SidebarMenuButton tooltip="User Management" className="w-full justify-between pr-8" isActive={pathname.startsWith("/dealer/user-management")}>
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
                            <Link href="/dealer/user-management/farmers">
                                <SidebarMenuButton size="sm" isActive={pathname === "/dealer/user-management/farmers"}>
                                Farmers List
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/dealer/user-management/dealers">
                                <SidebarMenuButton size="sm" isActive={pathname === "/dealer/user-management/dealers"}>
                                Dealers List
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/dealer/user-management/add-user">
                                <SidebarMenuButton size="sm" isActive={pathname === "/dealer/user-management/add-user"}>
                                Add New User
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
             <SidebarMenuItem>
                <Link href="/dealer/subscription-management">
                  <SidebarMenuButton isActive={pathname.startsWith("/dealer/subscription-management")} tooltip={"Subscriptions"}>
                    <Tags />
                    <span>{"Subscriptions"}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/dealer/transactions">
                  <SidebarMenuButton isActive={pathname.startsWith("/dealer/transactions")} tooltip={"Transactions"}>
                    <CreditCard />
                    <span>{"Transactions"}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />

        <SidebarGroupLabel>Content & AI</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dealer/daily-rates">
                <SidebarMenuButton isActive={pathname.startsWith("/dealer/daily-rates")} tooltip={"Daily Rates"}>
                  <TrendingUp />
                  <span>{"Daily Rates"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/dealer/chat-logs">
                <SidebarMenuButton isActive={pathname.startsWith("/dealer/chat-logs")} tooltip={"AI Chat Logs"}>
                  <Bot />
                  <span>{"AI Chat Logs"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="/dealer/notifications">
                <SidebarMenuButton isActive={pathname.startsWith("/dealer/notifications")} tooltip={"Notifications"}>
                  <Bell />
                  <span>{"Notifications"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="/dealer/promo-codes">
                <SidebarMenuButton isActive={pathname.startsWith("/dealer/promo-codes")} tooltip={"Promo Codes"}>
                  <Tags />
                  <span>{"Promo Codes"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/dealer/settings">
                    <SidebarMenuButton isActive={pathname.startsWith("/dealer/settings")} tooltip="Settings">
                        <Settings/>
                        <span>{"Settings"}</span>
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

  if (!currentUser) {
      return renderLoadingSidebar();
  }

  return isAdmin ? renderAdminSidebar() : renderDealerSidebar();
}
