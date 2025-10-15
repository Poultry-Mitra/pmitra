// src/app/admin/dashboard/_components/recent-transactions.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User, Order } from "@/lib/types";
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { useUsersByIds } from "@/hooks/use-users";
import { useMemo } from "react";

export function RecentTransactions({ orders, loading }: { orders: Order[], loading: boolean }) {
  const recentOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'Approved' || o.status === 'Completed')
      .slice(0, 5);
  }, [orders]);
  
  const userIds = useMemo(() => {
    const ids = new Set<string>();
    recentOrders.forEach(o => {
        if (o.farmerUID) ids.add(o.farmerUID);
        if (o.dealerUID) ids.add(o.dealerUID);
    });
    return Array.from(ids);
  }, [recentOrders]);

  const { users, loading: usersLoading } = useUsersByIds(userIds);
  const isLoading = loading || usersLoading;

  const getUser = (id?: string) => {
      if (!id) return null;
      return users.find(u => u.id === id);
  }
  
  const getTransactionPartyName = (order: Order) => {
    if (order.isOfflineSale) return order.offlineCustomerName || "Offline Sale";
    const farmer = getUser(order.farmerUID);
    return farmer?.name || '...';
  }

  const getTransactionPartyInitial = (order: Order) => {
     if (order.isOfflineSale) return (order.offlineCustomerName || "O").charAt(0);
     const farmer = getUser(order.farmerUID);
     return farmer?.name.charAt(0) || '-';
  }


  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-6">
                 {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                ))}
                 <Skeleton className="h-9 w-full" />
            </CardContent>
        </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Most recent approved orders and payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
         {recentOrders.length === 0 && <p className="text-sm text-muted-foreground text-center">No recent transactions found.</p>}
        {recentOrders.map((order, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback>{getTransactionPartyInitial(order)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{getTransactionPartyName(order)}</p>
                <p className="text-sm text-muted-foreground">
                  {order.productName}
                </p>
              </div>
            </div>
            <div className="ml-auto font-medium">+₹{order.totalAmount.toLocaleString()}</div>
          </div>
        ))}
         <Button asChild variant="outline" className="w-full">
            <Link href="/admin/transactions">View All Transactions</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
