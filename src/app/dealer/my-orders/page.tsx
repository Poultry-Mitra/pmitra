
// src/app/dealer/my-orders/page.tsx
"use client";

import { useState, useMemo, useEffect, useContext } from 'react';
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, AuthContext } from '@/firebase/provider';
import { useOrdersByDealer, updateOrderStatus } from '@/hooks/use-orders';
import { useUsersByIds } from '@/hooks/use-users';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/language-provider';


const statusConfig = {
    Pending: { variant: "outline" as const, color: "text-blue-500 border-blue-500/50 bg-blue-500/10" },
    Approved: { variant: "default" as const, color: "text-green-500 border-green-500/50 bg-green-500/10" },
    Completed: { variant: "default" as const, color: "text-green-500 border-green-500/50 bg-green-500/10" },
    Rejected: { variant: "destructive" as const, color: "text-red-500 border-red-500/50 bg-red-500/10" },
};


export default function MyOrdersPage() {
    const firestore = useFirestore();
    const auth = useAuth();
    const { user } = useContext(AuthContext)!;
    const { orders, loading: ordersLoading } = useOrdersByDealer(user?.uid);
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("pending");
    const { t } = useLanguage();

    const farmerIds = useMemo(() => {
        if (ordersLoading) return [];
        // Extract all unique farmerUIDs from orders, filtering out undefined ones
        return [...new Set(orders.map(o => o.farmerUID).filter((id): id is string => !!id))];
    }, [orders, ordersLoading]);
    
    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);

    const getFarmerName = (order: Order) => {
        if (order.isOfflineSale) {
            return order.offlineCustomerName || "Offline Sale";
        }
        return farmers.find(f => f.id === order.farmerUID)?.name || "Loading...";
    }
    
    // Improved loading state to wait for farmer names as well
    const loading = ordersLoading || (farmerIds.length > 0 && farmersLoading);

    const handleUpdateStatus = async (order: Order, newStatus: 'Approved' | 'Rejected') => {
        if (!firestore || !auth) return;
        try {
            await updateOrderStatus(order, newStatus, firestore, auth);
            toast({
                title: `Order ${newStatus}`,
                description: `The order has been successfully ${newStatus.toLowerCase()}.`
            });
        } catch (error: any) {
            toast({
                title: t('messages.error'),
                description: error.message || "Failed to update order status.",
                variant: "destructive"
            });
        }
    };
    
    const filteredOrders = useMemo(() => {
        if (activeTab === 'all') return orders;
        return orders.filter(o => o.status.toLowerCase() === activeTab);
    }, [orders, activeTab]);


    return (
        <>
            <PageHeader
                title={t('dealer.farmer_orders')}
                description="Review and manage incoming orders from your connected farmers."
            >
                <Button asChild>
                    <Link href="/dealer/my-orders/create">
                        <PlusCircle className="mr-2" />
                        {t('dealer.create_order')}
                    </Link>
                </Button>
            </PageHeader>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>All Orders</CardTitle>
                         <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="approved">Approved</TabsTrigger>
                                <TabsTrigger value="completed">Completed (Offline)</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                                <TabsTrigger value="all">All</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>{t('tables.status')}</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center">{t('tables.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                             <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && filteredOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No orders in this category.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {getFarmerName(order)}
                                            {order.isOfflineSale && <Badge variant="secondary" className="ml-2">Offline</Badge>}
                                        </TableCell>
                                        <TableCell>{order.productName}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusConfig[order.status].variant} className={statusConfig[order.status].color}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-center">
                                            {order.status === 'Pending' && (
                                                <div className="flex gap-2 justify-center">
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateStatus(order, 'Approved')}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleUpdateStatus(order, 'Rejected')}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                                    </Button>
                                                </div>
                                            )}
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
