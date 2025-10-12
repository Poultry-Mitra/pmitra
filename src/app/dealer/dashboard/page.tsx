// src/app/dealer/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, IndianRupee, Activity, PlusCircle, ShoppingBag, Loader2 } from "lucide-react";
import { RevenueChart } from "../_components/revenue-chart";
import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User as AppUser, Order } from "@/lib/types";
import { useUser, useFirestore } from "@/firebase/provider";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useUsersByIds } from "@/hooks/use-users";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';


const statusVariant = {
    Approved: "default",
    Rejected: "destructive",
    Pending: "secondary",
} as const;


function Sparkline({ data, color }: { data: { value: number }[], color: string }) {
    if (!data || data.length === 0) return <div className="h-10 w-20" />;
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

function KpiCard({ title, value, change, changeColor, icon: Icon, chartData, chartColor }: { title: string, value: string | number, change: string, changeColor: string, icon: React.ElementType, chartData: {value: number}[], chartColor: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className={`text-xs ${changeColor}`}>
                            {change}
                        </p>
                    </div>
                    <Sparkline data={chartData} color={chartColor} />
                </div>
            </CardContent>
        </Card>
    );
}

export default function DealerDashboardPage() {
    const { user: firebaseUser } = useUser();
    const firestore = useFirestore();
    const [user, setUser] = useState<AppUser | null>(null);
    
    const { orders, loading: ordersLoading } = useOrders(firebaseUser?.uid);
    
    const farmerIds = useMemo(() => {
        if (!user || !user.connectedFarmers) return [];
        return user.connectedFarmers;
    }, [user]);

    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);

    useEffect(() => {
        if (firebaseUser && firestore) {
            const userDocRef = doc(firestore, "users", firebaseUser.uid);
            const unsub = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUser({ id: docSnap.id, ...docSnap.data() } as AppUser);
                } else {
                    setUser(null);
                }
            });
             return () => unsub();
        } else {
            setUser(null);
        }
    }, [firebaseUser, firestore]);
    
    const loading = !user || ordersLoading || farmersLoading;

    const kpiData = useMemo(() => {
        if (loading) return null;
        
        const successfulOrders = orders.filter(o => o.status === 'Approved');
        const monthlyRevenue = successfulOrders.reduce((acc, order) => acc + order.totalAmount, 0);

        return {
            totalFarmers: user?.connectedFarmers?.length || 0,
            activeOrders: orders.filter(o => o.status === 'Pending').length,
            monthlyRevenue: `₹${monthlyRevenue.toLocaleString()}`,
            ordersFulfilled: successfulOrders.length
        };
    }, [loading, orders, user]);


    if (loading || !user) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin size-8" />
             </div>
        );
    }
    const pageTitle = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    const pageDescription = "Here's an overview of your business.";
    
    const handleTransactionClick = (txn: Order) => {
        const farmer = farmers.find(f => f.id === txn.farmerUID);
        alert(`Transaction Details:\n\nID: ${txn.id}\nFarmer: ${farmer?.name}\nAmount: ${txn.totalAmount}\nStatus: ${txn.status}\nDate: ${new Date(txn.createdAt).toLocaleDateString()}`);
    }

      return (
         <>
          <PageHeader title={pageTitle} description={pageDescription}>
              <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                      <Link href="/dealer/my-orders">
                          View All Orders
                      </Link>
                  </Button>
                  <Button asChild>
                      <Link href="/dealer/my-inventory/add">
                          <PlusCircle className="mr-2" />
                          Add Stock
                      </Link>
                  </Button>
              </div>
          </PageHeader>
           <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {kpiData && (
                   <>
                        <KpiCard 
                            title="Total Farmers" 
                            value={kpiData.totalFarmers} 
                            change="" 
                            changeColor="text-muted-foreground"
                            icon={Users}
                            chartData={[{ value: 1 }, { value: 1 }, { value: kpiData.totalFarmers }, { value: kpiData.totalFarmers }]}
                            chartColor="hsl(var(--chart-1))"
                        />
                        <KpiCard 
                            title="Active Orders" 
                            value={kpiData.activeOrders} 
                            change="Pending approval" 
                            changeColor="text-muted-foreground"
                            icon={ShoppingBag}
                            chartData={[{ value: 2 }, { value: 3 }, { value: 1 }, { value: kpiData.activeOrders }]}
                            chartColor="hsl(var(--chart-1))"
                        />
                        <KpiCard 
                            title="Monthly Revenue" 
                            value={kpiData.monthlyRevenue} 
                            change="+20.1% from last month"
                            changeColor="text-green-500" 
                            icon={IndianRupee}
                            chartData={[{ value: 10000 }, { value: 12000 }, { value: 15000 }, { value: 18000 }]}
                            chartColor="hsl(var(--chart-1))"
                        />
                        <KpiCard 
                            title="Orders Fulfilled" 
                            value={kpiData.ordersFulfilled} 
                            change="this month" 
                            changeColor="text-muted-foreground"
                            icon={Activity}
                            chartData={[{ value: 5 }, { value: 8 }, { value: 6 }, { value: kpiData.ordersFulfilled }]}
                            chartColor="hsl(var(--chart-2))"
                        />
                   </>
               )}
            </div>
             <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Cumulative revenue from successful orders in the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart orders={orders.filter(o => o.status === 'Approved')} />
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Pending Orders</CardTitle>
                        <CardDescription>Orders that require your immediate attention.</CardDescription>
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
                                {orders.filter(o => o.status === 'Pending').slice(0, 5).map(order => {
                                    const farmer = farmers.find(f => f.id === order.farmerUID);
                                    return (
                                    <TableRow key={order.id} onClick={() => handleTransactionClick(order)} className="cursor-pointer">
                                        <TableCell>{farmer?.name || '...'}</TableCell>
                                        <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                                    </TableRow>
                                )})}
                                {orders.filter(o => o.status === 'Pending').length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No pending orders.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </div>
         </>
      )
}
