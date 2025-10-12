// src/app/dealer/my-farmers/_components/farmer-details-dialog.tsx
"use client";

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBatches } from '@/hooks/use-batches';
import { useOrdersByFarmer } from '@/hooks/use-orders';
import { Loader2, Phone, MapPin } from 'lucide-react';
import type { User } from '@/lib/types';

interface FarmerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmer: User;
}

export function FarmerDetailsDialog({ open, onOpenChange, farmer }: FarmerDetailsDialogProps) {
    const { batches, loading: batchesLoading } = useBatches(farmer.id);
    const { orders, loading: ordersLoading } = useOrdersByFarmer(farmer.id);
    const loading = batchesLoading || ordersLoading;

    const stats = useMemo(() => {
        if (loading) return null;
        return {
            activeBatches: batches.filter(b => b.status === 'Active').length,
            completedBatches: batches.filter(b => b.status === 'Completed').length,
            approvedOrders: orders.filter(o => o.status === 'Approved').length,
            pendingOrders: orders.filter(o => o.status === 'Pending').length,
        }
    }, [batches, orders, loading]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-2xl">{farmer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl">{farmer.name}</DialogTitle>
                            <DialogDescription>{farmer.email}</DialogDescription>
                             <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Phone className="size-4" />
                                <span>{farmer.mobileNumber || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="size-4" />
                                <span>{farmer.district}, {farmer.state}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading || !stats ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="rounded-md border p-3">
                                        <p className="text-2xl font-bold">{stats.activeBatches}</p>
                                        <p className="text-xs text-muted-foreground">Active Batches</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-2xl font-bold">{stats.completedBatches}</p>
                                        <p className="text-xs text-muted-foreground">Completed Batches</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-2xl font-bold text-green-600">{stats.approvedOrders}</p>
                                        <p className="text-xs text-muted-foreground">Approved Orders</p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-2xl font-bold text-orange-500">{stats.pendingOrders}</p>
                                        <p className="text-xs text-muted-foreground">Pending Orders</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
