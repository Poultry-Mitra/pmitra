
// src/app/admin/my-farmers/page.tsx
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
import { PlusCircle, MoreHorizontal, AlertTriangle } from "lucide-react";
import { mockUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { ConnectFarmerDialog } from './_components/connect-farmer-dialog';

type ConnectionStatus = "Approved" | "Pending";
type ConnectedFarmer = {
    user: User;
    status: ConnectionStatus;
    connectedAt: Date;
}

// Mock data for now
const mockConnections: ConnectedFarmer[] = [
    { user: mockUsers.find(u => u.id === 'usr_farmer_002')!, status: 'Approved', connectedAt: new Date('2023-05-10') },
    { user: mockUsers.find(u => u.id === 'usr_farmer_004')!, status: 'Pending', connectedAt: new Date('2023-10-20') },
];

const statusVariant: { [key in ConnectionStatus]: "default" | "outline" } = {
  Approved: "default",
  Pending: "outline",
};

export default function MyFarmersPage() {
    const [connections, setConnections] = useState<ConnectedFarmer[]>(mockConnections);
    const [isConnectDialogOpen, setConnectDialogOpen] = useState(false);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

    // In a real app, this would come from the dealer's user object.
    const dealerPlan = "free"; 
    const farmerLimit = 2;
    const canAddMoreFarmers = dealerPlan === 'premium' || connections.length < farmerLimit;

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
                            You have {connections.length} farmers connected.
                            {dealerPlan === 'free' && ` You can connect ${farmerLimit - connections.length} more on the free plan.`}
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
                                {connections.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No farmers connected yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {connections.map((conn) => (
                                    <TableRow key={conn.user.id}>
                                        <TableCell className="font-medium">{conn.user.name}</TableCell>
                                        <TableCell>{conn.user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[conn.status]}>{conn.status}</Badge>
                                        </TableCell>
                                        <TableCell>{conn.connectedAt.toLocaleDateString()}</TableCell>
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
