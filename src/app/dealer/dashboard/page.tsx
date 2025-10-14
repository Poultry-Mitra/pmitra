
// src/app/dealer/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, IndianRupee, Activity, PlusCircle, ShoppingBag, Loader2, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User as AppUser, Order } from "@/lib/types";
import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useUsersByIds } from "@/hooks/use-users";
import { useAppUser } from "@/app/app-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "../_components/revenue-chart";
import { useConnections, updateConnectionStatus } from "@/hooks/use-connections";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase/provider";


function KpiCard({ title, value, change, changeColor, icon: Icon }: { title: string, value: string | number, change: string, changeColor: string, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs ${changeColor}`}>
                    {change}
                </p>
            </CardContent>
        </Card>
    );
}

function FarmerConnectionRequests() {
    const { user: appUser, loading: appUserLoading } = useAppUser();
    const { connections, loading: connectionsLoading } = useConnections(appUser?.id, 'dealer');
    const firestore = useFirestore();
    const { toast } = useToast();

    const pendingRequests = useMemo(() => 
        connections.filter(c => c.status === 'Pending' && c.requestedBy === 'farmer'), 
    [connections]);

    const farmerIds = useMemo(() => pendingRequests.map(r => r.farmerUID), [pendingRequests]);
    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);
    
    const loading = appUserLoading || connectionsLoading || farmersLoading;
    
    if (loading || pendingRequests.length === 0) {
        return null;
    }
    
    const getFarmerName = (farmerId: string) => {
        return farmers.find(d => d.id === farmerId)?.name || "Loading...";
    }

    const handleAction = async (connectionId: string, status: 'Approved' | 'Rejected') => {
        if (!firestore) return;
        try {
            await updateConnectionStatus(firestore, connectionId, status);
            toast({
                title: `Request ${status}`,
                description: "The connection has been updated."
            })
        } catch(e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Farmer Connection Requests</CardTitle>
                <CardDescription>Review and respond to connection requests from farmers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Farmer Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{getFarmerName(req.farmerUID)}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleAction(req.id, 'Approved')}>
                                        <CheckCircle className="mr-2" />
                                        Approve
                                    </Button>
                                     <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(req.id, 'Rejected')}>
                                        <XCircle className="mr-2" />
                                        Reject
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function RecentTransactions({ orders, farmers }: { orders: Order[], farmers: AppUser[] }) {
    const handleTransactionClick = (txn: Order) => {
        const farmer = farmers.find(f => f.id === txn.farmerUID);
        alert(`Transaction Details:\n\nID: ${txn.id}\nFarmer: ${farmer?.name}\nAmount: ${txn.totalAmount}\nStatus: ${txn.status}\nDate: ${new Date(txn.createdAt).toLocaleDateString()}`);
    }

     return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Pending Orders</CardTitle>
                <p className="text-sm text-muted-foreground">Orders that require your immediate attention.</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                            )
                        })}
                        {orders.filter(o => o.status === 'Pending').length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No pending orders.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function DealerDashboardPage() {
    const { user, loading: appUserLoading } = useAppUser();
    const { orders, loading: ordersLoading } = useOrders(user?.id);
    
    const farmerIds = useMemo(() => {
        if (!user || !user.connectedFarmers) return [];
        return user.connectedFarmers;
    }, [user]);

    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);

    const loading = appUserLoading || ordersLoading || farmersLoading;

    const kpiData = useMemo(() => {
        if (loading || !user) return null;
        
        const successfulOrders = orders.filter(o => o.status === 'Approved' || o.status === 'Completed');
        const monthlyRevenue = successfulOrders.reduce((acc, order) => acc + order.totalAmount, 0);

        return {
            totalFarmers: user?.connectedFarmers?.length || 0,
            activeOrders: orders.filter(o => o.status === 'Pending').length,
            monthlyRevenue: `₹${monthlyRevenue.toLocaleString()}`,
            ordersFulfilled: successfulOrders.length
        };
    }, [loading, orders, user]);


    if (appUserLoading || !user) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin size-8" />
             </div>
        );
    }
    const pageTitle = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    const pageDescription = "Here's an overview of your business.";

      return (
         <>
          <PageHeader title={pageTitle} description={pageDescription}>
              <div className="flex items-center gap-2 flex-wrap">
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
               {loading || !kpiData ? (
                   [...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-1/2 mt-4" />
                                <Skeleton className="h-3 w-1/3 mt-1" />
                            </CardContent>
                        </Card>
                   ))
               ) : (
                   <>
                        <KpiCard 
                            title="Total Farmers" 
                            value={kpiData.totalFarmers} 
                            change="" 
                            changeColor="text-muted-foreground"
                            icon={Users}
                        />
                        <KpiCard 
                            title="Active Orders" 
                            value={kpiData.activeOrders} 
                            change="Pending approval" 
                            changeColor="text-muted-foreground"
                            icon={ShoppingBag}
                        />
                        <KpiCard 
                            title="Monthly Revenue" 
                            value={kpiData.monthlyRevenue} 
                            change="+20.1% from last month"
                            changeColor="text-green-500" 
                            icon={IndianRupee}
                        />
                        <KpiCard 
                            title="Orders Fulfilled" 
                            value={kpiData.ordersFulfilled} 
                            change="this month" 
                            changeColor="text-muted-foreground"
                            icon={Activity}
                        />
                   </>
               )}
            </div>
             <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                         <p className="text-sm text-muted-foreground">Cumulative revenue from successful orders in the last 30 days.</p>
                    </CardHeader>
                    <CardContent>
                         {loading ? <div className="flex h-[300px] w-full items-center justify-center"><Loader2 className="animate-spin" /></div> : <RevenueChart orders={orders.filter(o => o.status === 'Approved' || o.status === 'Completed')} />}
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    {loading ? <Skeleton className="h-full w-full" /> : <RecentTransactions orders={orders} farmers={farmers} />}
                </div>
            </div>
            <div className="mt-8">
                <FarmerConnectionRequests />
            </div>
         </>
      )
}
