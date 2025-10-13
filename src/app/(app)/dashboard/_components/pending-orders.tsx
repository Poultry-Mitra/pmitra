
// src/app/dashboard/_components/pending-orders.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrdersByFarmer, updateOrderStatus } from "@/hooks/use-orders";
import { useUser, useFirestore } from "@/firebase/provider";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";

export function PendingOrders() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { orders, loading } = useOrdersByFarmer(user?.uid);
    const { toast } = useToast();

    const pendingOrders = orders.filter(o => o.status === 'Pending');

    const handleUpdateStatus = async (order: Order, status: 'Approved' | 'Rejected') => {
        try {
            await updateOrderStatus(order, status, firestore);
            toast({
                title: `Order ${status}`,
                description: `The order for ${order.productName} has been successfully ${status.toLowerCase()}.`
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update order status.",
                variant: "destructive"
            });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Dealer Orders</CardTitle>
                <CardDescription>Review and respond to orders sent by your connected dealers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="mx-auto animate-spin" />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && pendingOrders.length === 0 && (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    You have no pending orders.
                                </TableCell>
                            </TableRow>
                        )}
                         {!loading && pendingOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.productName}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell className="text-right">₹{order.totalAmount.toLocaleString()}</TableCell>
                                <TableCell className="text-center space-x-2">
                                    <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleUpdateStatus(order, 'Approved')}>
                                        <CheckCircle className="mr-2" />
                                        Accept
                                    </Button>
                                     <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleUpdateStatus(order, 'Rejected')}>
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
    );
}
