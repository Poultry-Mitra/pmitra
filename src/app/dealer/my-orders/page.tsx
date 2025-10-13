
// src/app/dealer/my-orders/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { useUser, useFirestore } from '@/firebase/provider';
import { useOrders, updateOrderStatus } from '@/hooks/use-orders';
import { useUsersByIds } from '@/hooks/use-users';
import { CreateOrderDialog } from './_components/create-order-dialog';
import type { Order, User as AppUser, Connection } from '@/lib/types';
import { useConnections } from '@/hooks/use-connections';

const statusConfig = {
    Pending: { variant: "outline" as const, color: "text-blue-500 border-blue-500/50 bg-blue-500/10" },
    Approved: { variant: "default" as const, color: "text-green-500 border-green-500/50 bg-green-500/10" },
    Rejected: { variant: "destructive" as const, color: "text-red-500 border-red-500/50 bg-red-500/10" },
};


export default function MyOrdersPage() {
    const { user: firebaseUser } = useUser();
    const firestore = useFirestore();
    const { orders, loading: ordersLoading } = useOrders(firebaseUser?.uid);
    const { toast } = useToast();
    const [isCreateOrderOpen, setCreateOrderOpen] = useState(false);

    // Fetch this dealer's connections to get farmer IDs
    const { connections, loading: connectionsLoading } = useConnections(firebaseUser?.uid, 'dealer');

    // Get the IDs of all connected farmers
    const connectedFarmerIds = useMemo(() => {
        return connections
            .map(c => c.farmerUID);
    }, [connections]);
    
    // Fetch user details for all potentially connected farmers
    const { users: farmers, loading: farmersLoading } = useUsersByIds(connectedFarmerIds);

    const getFarmerName = (farmerUID: string) => {
        return farmers.find(f => f.id === farmerUID)?.name || "Unknown Farmer";
    }
    
    const loading = ordersLoading || farmersLoading || connectionsLoading || !firebaseUser;

    const handleUpdateStatus = async (order: Order, newStatus: 'Approved' | 'Rejected') => {
        if (!firestore) return;
        try {
            await updateOrderStatus(order, newStatus, firestore);
            toast({
                title: `Order ${newStatus}`,
                description: `The order has been successfully ${newStatus.toLowerCase()}.`
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update order status.",
                variant: "destructive"
            });
        }
    };

    // Filter orders to show only those from connected farmers
    const visibleOrders = useMemo(() => {
        if (loading) return [];
        return orders.filter(order => connectedFarmerIds.includes(order.farmerUID));
    }, [orders, connectedFarmerIds, loading]);


    return (
        <>
            <PageHeader
                title="Farmer Orders"
                description="Review and manage incoming orders from your connected farmers."
            >
                <Button onClick={() => setCreateOrderOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Create Order for Farmer
                </Button>
            </PageHeader>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>All Orders</CardTitle>
                        <CardDescription>
                            A list of all pending, approved, and rejected orders from your farmers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
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
                                {!loading && visibleOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No orders found from your connected farmers.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && visibleOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{getFarmerName(order.farmerUID)}</TableCell>
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
            { firebaseUser && <CreateOrderDialog open={isCreateOrderOpen} onOpenChange={setCreateOrderOpen} />}
        </>
    );
}
