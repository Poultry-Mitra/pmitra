
// src/app/admin/dashboard/_components/recent-transactions.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types"; // Assuming a shared types definition
import Link from 'next/link';

// Mock data, in a real app this would come from a Firestore hook
const mockTransactions = [
  { amount: 249, userName: "Rohan Patel", userEmail: "rohan@example.com" },
  { amount: 499, userName: "Priya Singh", userEmail: "priya.dealer@example.com" },
  { amount: 249, userName: "Sanjay Kumar", userEmail: "sanjay.k@example.com" },
];

export function RecentTransactions({ users, loading }: { users: User[], loading: boolean }) {
  if (loading) {
    return <CardDescription>Loading transactions...</CardDescription>
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Recent subscription payments and upgrades.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {mockTransactions.map((txn, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback>{txn.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{txn.userName}</p>
                <p className="text-sm text-muted-foreground">
                  {txn.userEmail}
                </p>
              </div>
            </div>
            <div className="ml-auto font-medium">+₹{txn.amount}</div>
          </div>
        ))}
         <Button asChild variant="outline" className="w-full">
            <Link href="/admin/transactions">View All Transactions</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
