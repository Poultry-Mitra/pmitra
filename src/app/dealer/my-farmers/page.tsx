
// src/app/dealer/my-farmers/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, AlertTriangle, Loader2 } from "lucide-react";
import { useUsersByIds } from '@/hooks/use-users';
import type { User } from "@/lib/types";
import { ConnectFarmerDialog } from './_components/connect-farmer-dialog';
import { useUser } from '@/firebase/provider';
import { useClientState } from '@/hooks/use-client-state';

type ConnectionStatus = "Approved" | "Pending";

const statusVariant: { [key in ConnectionStatus]: "default" | "outline" } = {
  Approved: "default",
  Pending: "outline",
};

export default function MyFarmersPage() {
    const dealer = useUser();
    // Using useClientState to safely access dealer properties that might not be available on the server
    const connectedFarmerIds = useClientState(() => dealer?.connectedFarmers || [], []);
    const planType = useClientState(() => dealer?.planType || 'free', 'free');
    
    const { users: connectedFarmers, loading } = useUsersByIds(connectedFarmerIds);

    const [isConnectDialogOpen, setConnectDialogOpen] = useState(false);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

    const farmerLimit = 2;
    const canAddMoreFarmers = planType === 'premium' || connectedFarmers.length < farmerLimit;

    const handleConnectClick = () => {
        if (canAddMoreFarmers) {
            setConnectDialogOpen(true);
        } else {
            setShowUpgradeAlert(true);
        }
    };
    
    return (
        <>
            <PageHeader
                title="My Farmers"
                description="Manage your network of connected farmers."
            >
                <Button onClick={handleConnectClick}>
                    <PlusCircle className="mr-2" />
                    Connect New Farmer
                </Button>
            </PageHeader>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Farmers</CardTitle>
                        <CardDescription>
                            You have {connectedFarmers.length} farmers connected.
                            {planType === 'free' && ` You can connect ${Math.max(0, farmerLimit - connectedFarmers.length)} more on the free plan.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Farmer Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Connected Since</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && connectedFarmers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No farmers connected yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && connectedFarmers.map((farmer) => (
                                    <TableRow key={farmer.id}>
                                        <TableCell className="font-medium">{farmer.name}</TableCell>
                                        <TableCell>{farmer.email}</TableCell>
                                        <TableCell>
                                            {/* Note: Connection status logic would be more complex in a real app */}
                                            <Badge variant={statusVariant["Approved"]}>Approved</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(farmer.dateJoined).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <ConnectFarmerDialog open={isConnectDialogOpen} onOpenChange={setConnectDialogOpen} />
            <AlertDialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-orange-500"/>
                            Free Plan Limit Reached
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You have reached the maximum of {farmerLimit} connected farmers on the Free Plan. Please upgrade to Premium to connect with unlimited farmers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                        <Link href="/pricing">Upgrade to Premium</Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
