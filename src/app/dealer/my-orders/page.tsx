// src/app/dealer/my-orders/page.tsx
"use client";

import { useState, useMemo } from 'react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2, PlusCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/provider';
import { useOrders } from '@/hooks/use-orders';
import { useUsersByIds } from '@/hooks/use-users';
import { CreateOrderDialog } from './_components/create-order-dialog';

const statusConfig = {
    Pending: { variant: "outline" as const, color: "text-blue-500 border-blue-500/50 bg-blue-500/10" },
    Approved: { variant: "default" as const, color: "text-green-500 border-green-500/50 bg-green-500/10" },
    Rejected: { variant: "destructive" as const, color: "text-red-500 border-red-500/50 bg-red-500/10" },
};


export default function MyOrdersPage() {
    const user = useUser();
    const { orders, loading: ordersLoading } = useOrders(user?.uid);
    const { toast } = useToast();
    const [isCreateOrderOpen, setCreateOrderOpen] = useState(false);
    
    const farmerIds = useMemo(() => {
        if (!orders) return [];
        return [...new Set(orders.map(o => o.farmerUID))];
    }, [orders]);

    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);
    
    const getFarmerName = (farmerUID: string) => {
        return farmers.find(f => f.id === farmerUID)?.name || "Loading...";
    }
    
    const loading = ordersLoading || farmersLoading;

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
                            A list of all pending, approved, and rejected orders sent to your farmers.
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
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                             <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && orders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && orders.map((order) => (
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
                                                     <DropdownMenuItem disabled>View Details</DropdownMenuItem>
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
            <CreateOrderDialog open={isCreateOrderOpen} onOpenChange={setCreateOrderOpen} />
        </>
    );
}
