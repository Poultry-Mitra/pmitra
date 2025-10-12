
// src/app/dealer/my-orders/page.tsx
"use client";

import { useState } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { mockUsers } from "@/lib/data";
import type { Order } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';

// Mock data for now
const initialOrders: Order[] = [
    { id: 'ord_1', farmerUID: 'usr_farmer_002', dealerUID: 'usr_dealer_003', batchId: 'batch_1', productId: 'prod_1', productName: 'Broiler Starter Crumble', quantity: 10, ratePerUnit: 2200, totalAmount: 22000, status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 'ord_2', farmerUID: 'usr_farmer_004', dealerUID: 'usr_dealer_003', batchId: 'batch_2', productId: 'prod_3', productName: 'Cobb 430Y Chicks', quantity: 500, ratePerUnit: 45, totalAmount: 22500, status: 'Approved', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'ord_3', farmerUID: 'usr_farmer_002', dealerUID: 'usr_dealer_003', batchId: 'batch_1', productId: 'prod_4', productName: 'Vimeral Liquid', quantity: 5, ratePerUnit: 350, totalAmount: 1750, status: 'Rejected', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
     { id: 'ord_4', farmerUID: 'usr_farmer_004', dealerUID: 'usr_dealer_003', batchId: 'batch_2', productId: 'prod_2', productName: 'Broiler Finisher Pellets', quantity: 20, ratePerUnit: 2150, totalAmount: 43000, status: 'Pending', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

const statusConfig = {
    Pending: { variant: "outline" as const, color: "text-blue-500 border-blue-500/50 bg-blue-500/10" },
    Approved: { variant: "default" as const, color: "text-green-500 border-green-500/50 bg-green-500/10" },
    Rejected: { variant: "destructive" as const, color: "text-red-500 border-red-500/50 bg-red-500/10" },
};


export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [dialogState, setDialogState] = useState<{ action: 'approve' | 'reject' | null, order: Order | null }>({ action: null, order: null });
    const { toast } = useToast();

    const getFarmerName = (farmerUID: string) => mockUsers.find(u => u.id === farmerUID)?.name || "Unknown Farmer";
    
    const handleAction = () => {
        if (!dialogState.action || !dialogState.order) return;

        const newStatus = dialogState.action === 'approve' ? 'Approved' : 'Rejected';
        setOrders(orders.map(o => o.id === dialogState.order!.id ? { ...o, status: newStatus } : o));
        
        toast({
            title: `Order ${newStatus}`,
            description: `Order #${dialogState.order.id.slice(-4)} has been ${newStatus.toLowerCase()}.`,
            variant: newStatus === 'Rejected' ? 'destructive' : 'default',
        });

        setDialogState({ action: null, order: null });
    };

    return (
        <>
            <PageHeader
                title="Farmer Orders"
                description="Review and manage incoming orders from your connected farmers."
            />

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Incoming Orders</CardTitle>
                        <CardDescription>
                            A list of all pending, approved, and rejected orders.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {orders.map((order) => (
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
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Order menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setDialogState({ action: 'approve', order })}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setDialogState({ action: 'reject', order })}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject
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
            
            <AlertDialog open={!!dialogState.action} onOpenChange={() => setDialogState({ action: null, order: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                             {dialogState.action === 'approve' ? <CheckCircle className="text-green-500"/> : <AlertTriangle className="text-orange-500"/>}
                            Confirm Action: {dialogState.action === 'approve' ? 'Approve Order' : 'Reject Order'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to {dialogState.action} this order for {dialogState.order?.productName} (Qty: {dialogState.order?.quantity})?
                             {dialogState.action === 'approve' && " This will lock the inventory and notify the farmer."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleAction}
                            className={dialogState.action === 'reject' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}
                        >
                            Yes, {dialogState.action === 'approve' ? 'Approve' : 'Reject'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
