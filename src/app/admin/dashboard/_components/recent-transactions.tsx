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
    return [...new Set(recentOrders.map(o => o.farmerUID).filter(Boolean) as string[])];
  }, [recentOrders]);

  const { users: farmers, loading: usersLoading } = useUsersByIds(userIds);
  const isLoading = loading || usersLoading;

  const getFarmerName = (farmerId?: string) => {
      if (!farmerId) return "Offline Sale";
      return farmers.find(f => f.id === farmerId)?.name || '...';
  }
  
  const getFarmerInitial = (farmerId?: string) => {
      if (!farmerId) return "O";
      const name = farmers.find(f => f.id === farmerId)?.name;
      return name ? name.charAt(0) : '-';
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
                <AvatarFallback>{getFarmerInitial(order.farmerUID)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{getFarmerName(order.farmerUID)}</p>
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
