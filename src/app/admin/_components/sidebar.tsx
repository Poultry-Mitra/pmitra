
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
} from "@/components/ui/sidebar";
import { AppIcon } from "@/app/icon";
import {
  LayoutGrid,
  Users,
  Bot,
  BarChart2,
  CreditCard,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const [userManagementOpen, setUserManagementOpen] = useState(pathname.startsWith('/admin/user-management'));


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <AppIcon className="size-8 text-primary" />
            {state === 'expanded' && <h1 className="font-headline text-lg font-bold">PoultryMitra</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
              <Link href="/admin/dashboard">
                <SidebarMenuButton
                  isActive={pathname === "/admin/dashboard"}
                  tooltip={"Dashboard"}
                >
                  <LayoutGrid />
                  <span>{"Dashboard"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>

          <Collapsible open={userManagementOpen} onOpenChange={setUserManagementOpen}>
            <SidebarMenuItem className="relative">
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="User Management" className="w-full justify-between pr-8" isActive={pathname.startsWith("/admin/user-management")}>
                      <div className="flex items-center gap-3">
                          <Users />
                          <span>User Management</span>
                      </div>
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              { state === 'expanded' && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {userManagementOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </div>
              )}
            </SidebarMenuItem>

            <CollapsibleContent>
                 <SidebarMenu className="ml-7 mt-1 border-l pl-3">
                    <SidebarMenuItem>
                        <Link href="/admin/user-management/farmers">
                            <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/farmers"}>
                            Farmers List
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/user-management/dealers">
                            <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/dealers"}>
                            Dealers List
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <Link href="/admin/user-management/add-user">
                            <SidebarMenuButton size="sm" isActive={pathname === "/admin/user-management/add-user"}>
                            Add New User
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
          
          <SidebarMenuItem>
              <Link href="/admin/chat-logs">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/chat-logs")}
                  tooltip={"AI Chat Logs"}
                >
                  <Bot />
                  <span>{"AI Chat Logs"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/reports">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/reports")}
                  tooltip={"Reports & Analytics"}
                >
                  <BarChart2 />
                  <span>{"Reports & Analytics"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Link href="/admin/transactions">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/transactions")}
                  tooltip={"Transactions"}
                >
                  <CreditCard />
                  <span>{"Transactions"}</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          
          <SidebarSeparator />
          
           <SidebarMenuItem>
              <Link href="/admin/settings">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/settings")}
                  tooltip={"System Settings"}
                >
                  <Settings />
                  <span>System Settings</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>

           <SidebarMenuItem>
              <Link href="/admin/notifications">
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin/notifications")}
                  tooltip={"Notifications"}
                >
                  <Bell />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/admin/settings">
                    <SidebarMenuButton 
                        tooltip="Profile"
                        isActive={pathname.startsWith("/admin/settings")}
                    >
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
