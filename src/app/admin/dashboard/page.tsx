
// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockUsers, currentDealer } from "@/lib/data";
import { Users, Bot, IndianRupee, Activity, PlusCircle, Send, ShoppingBag } from "lucide-react";
import { RevenueChart } from "../_components/revenue-chart";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useClientState } from "@/hooks/use-client-state";
import type { User } from "@/lib/types";


import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

const kpiData = {
    admin: [
        // ... admin specific kpi data
    ],
    dealer: [
        {
            title: "Total Farmers",
            value: "2",
            change: "+1 this month",
            changeColor: "text-green-500",
            icon: Users,
            chartData: [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 2 }, { value: 2 }, { value: 2 }],
            chartColor: "hsl(var(--chart-1))"
        },
        {
            title: "Active Orders",
            value: "2",
            change: "+50%",
            changeColor: "text-green-500",
            icon: ShoppingBag,
            chartData: [{ value: 2 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 5 }, { value: 4 }],
            chartColor: "hsl(var(--chart-1))"
        },
        {
            title: "Monthly Revenue",
            value: "₹45,249",
            change: "+20.1%",
            changeColor: "text-green-500",
            icon: IndianRupee,
            chartData: [{ value: 10000 }, { value: 12000 }, { value: 15000 }, { value: 14000 }, { value: 18000 }, { value: 20000 }],
            chartColor: "hsl(var(--chart-1))"
        },
        {
            title: "Orders Fulfilled",
            value: "12",
            change: "this month",
            changeColor: "text-muted-foreground",
            icon: Activity,
            chartData: [{ value: 5 }, { value: 6 }, { value: 8 }, { value: 10 }, { value: 11 }, { value: 12 }],
            chartColor: "hsl(var(--chart-2))"
        }
    ]
};

// Mock data, in real app this would be filtered by dealerUID
const transactions = [
    { id: 'txn_2', user: mockUsers.find(u => u.id === 'usr_farmer_004'), plan: 'Order #ORD-2 Payment', amount: 'INR 22,500', status: 'Success', date: '2023-10-28' },
    { id: 'txn_3', user: mockUsers.find(u => u.id === 'usr_farmer_002'), plan: 'Order #ORD-1 Payment', amount: 'INR 22,000', status: 'Pending', date: '2023-10-27' },
    { id: 'txn_5', user: mockUsers.find(u => u.id === 'usr_farmer_002'), plan: 'Order #ORD-3 Payment', amount: 'INR 1,750', status: 'Failed', date: '2023-10-26' },
];

const statusVariant = {
    Success: "default",
    Failed: "destructive",
    Pending: "secondary",
} as const;


function Sparkline({ data, color }: { data: { value: number }[], color: string }) {
    return (
        <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                        <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default function AdminDashboardPage() {
    const user = useClientState<User | undefined>(currentDealer);

    if (!user) {
        // You can return a loading skeleton here
        return (
            <PageHeader title="Loading..." description="Please wait while we load your dashboard." />
        );
    }

    const isAdmin = user.role === 'admin';
    const pageTitle = isAdmin ? "Admin Dashboard" : `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    const pageDescription = isAdmin ? "Overview of the PoultryMitra ecosystem." : "Here's an overview of your business.";

    const handleTransactionClick = (txn: any) => {
        alert(`Transaction Details:\n\nID: ${txn.id}\nFarmer: ${txn.user.name}\nAmount: ${txn.amount}\nStatus: ${txn.status}\nDate: ${txn.date}`);
    }


    if (!isAdmin) {
      // Render Dealer specific dashboard
      return (
         <>
          <PageHeader title={pageTitle} description={pageDescription}>
              <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                      <Link href="/admin/my-orders">
                          View All Orders
                      </Link>
                  </Button>
                  <Button asChild>
                      <Link href="/admin/my-inventory/add">
                          <PlusCircle className="mr-2" />
                          Add Stock
                      </Link>
                  </Button>
              </div>
          </PageHeader>
           <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiData.dealer.map(kpi => (
                    <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    <p className={`text-xs ${kpi.changeColor}`}>
                                        {kpi.change}
                                    </p>
                                </div>
                                <Sparkline data={kpi.chartData} color={kpi.chartColor} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Monthly revenue from orders and subscriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={[]} />
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your most recent financial activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.slice(0, 3).map(txn => {
                                    if (!txn.user) return null;
                                    return (
                                    <TableRow key={txn.id} onClick={() => handleTransactionClick(txn)} className="cursor-pointer">
                                        <TableCell>{txn.user.name}</TableCell>
                                        <TableCell>{txn.amount}</TableCell>
                                        <TableCell><Badge variant={statusVariant[txn.status as keyof typeof statusVariant]} className="capitalize">{txn.status}</Badge></TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </div>
         </>
      )
    }

    // Render Admin specific dashboard
    return (
        <>
            <PageHeader title={pageTitle} description={pageDescription}>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/notifications">
                            <Send className="mr-2" />
                            Send Notification
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/user-management/add-user">
                            <PlusCircle className="mr-2" />
                            Add User
                        </Link>
                    </Button>
                </div>
            </PageHeader>
            <div className="mt-8">
               <p>Admin-specific content will go here.</p>
            </div>
        </>
    )
}
