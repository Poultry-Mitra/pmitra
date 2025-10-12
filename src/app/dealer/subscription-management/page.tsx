
"use client";

import { PageHeader } from "@/app/dealer/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

type SubscriptionPlan = "Free" | "Farmer Plan" | "Dealer Plan";
type SubscriptionStatus = "Active" | "Canceled" | "Past Due";

type Subscription = {
  user: User;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  nextBillingDate: string;
};

const initialSubscriptions: Subscription[] = [
  { user: mockUsers[1], plan: 'Farmer Plan', status: 'Active', nextBillingDate: '2023-11-28' },
  { user: mockUsers[3], plan: 'Dealer Plan', status: 'Active', nextBillingDate: '2023-11-28' },
  { user: mockUsers[2], plan: 'Farmer Plan', status: 'Canceled', nextBillingDate: 'N/A' },
  { user: mockUsers[4], plan: 'Farmer Plan', status: 'Past Due', nextBillingDate: '2023-10-27' },
];

const statusVariant: { [key in SubscriptionStatus]: "default" | "secondary" | "destructive" } = {
  Active: "default",
  Canceled: "secondary",
  "Past Due": "destructive",
};

export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const { toast } = useToast();

  const handlePlanChange = (userId: string, newPlan: SubscriptionPlan) => {
    setSubscriptions(subs => subs.map(s => s.user.id === userId ? { ...s, plan: newPlan } : s));
    toast({ title: "Subscription Updated", description: `User's plan has been changed to ${newPlan}.` });
  };

  const handleCancel = (userId: string) => {
    setSubscriptions(subs => subs.map(s => s.user.id === userId ? { ...s, status: 'Canceled', nextBillingDate: 'N/A' } : s));
    toast({ title: "Subscription Canceled", description: "The user's subscription has been canceled.", variant: "destructive" });
  };

  return (
    <>
      <PageHeader
        title="Subscription Management"
        description="View, manage, and update user subscription plans."
      />
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>User Subscriptions</CardTitle>
            <CardDescription>A list of all active and inactive subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Billing Date</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map(sub => (
                  <TableRow key={sub.user.id}>
                    <TableCell>
                      <div className="font-medium">{sub.user.name}</div>
                      <div className="text-sm text-muted-foreground">{sub.user.email}</div>
                    </TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[sub.status]}>{sub.status}</Badge>
                    </TableCell>
                    <TableCell>
                        {sub.status === 'Canceled' ? 'N/A' : new Date(sub.nextBillingDate).toLocaleDateString('en-CA')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Plan</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handlePlanChange(sub.user.id, 'Free')}>Set to Free</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePlanChange(sub.user.id, 'Farmer Plan')}>Set to Farmer</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePlanChange(sub.user.id, 'Dealer Plan')}>Set to Dealer</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleCancel(sub.user.id)}
                          >
                            Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
