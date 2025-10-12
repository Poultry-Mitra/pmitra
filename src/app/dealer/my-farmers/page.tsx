// src/app/dealer/my-farmers/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, MoreHorizontal, AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useUsersByIds } from '@/hooks/use-users';
import { ConnectFarmerDialog } from './_components/connect-farmer-dialog';
import { useUser, useFirestore } from '@/firebase/provider';
import type { User, Connection } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { useConnections, updateConnectionStatus } from '@/hooks/use-connections';
import { useToast } from '@/hooks/use-toast';

export default function MyFarmersPage() {
    const dealerUser = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [dealer, setDealer] = useState<User | null>(null);

    useEffect(() => {
        if (!firestore || !dealerUser?.uid) return;
        const unsub = onSnapshot(doc(firestore, 'users', dealerUser.uid), (doc) => {
            if (doc.exists()) {
                setDealer(doc.data() as User);
            }
        });
        return () => unsub();
    }, [firestore, dealerUser?.uid]);

    const { connections: allConnections, loading: connectionsLoading } = useConnections(dealerUser?.uid, 'dealer');
    
    const pendingConnections = useMemo(() => allConnections.filter(c => c.status === 'Pending' && c.requestedBy === 'farmer'), [allConnections]);
    const approvedConnections = useMemo(() => allConnections.filter(c => c.status === 'Approved'), [allConnections]);

    const connectedFarmerIds = useMemo(() => approvedConnections.map(c => c.farmerUID), [approvedConnections]);
    const pendingFarmerIds = useMemo(() => pendingConnections.map(c => c.farmerUID), [pendingConnections]);

    const { users: connectedFarmers, loading: connectedFarmersLoading } = useUsersByIds(connectedFarmerIds);
    const { users: pendingFarmers, loading: pendingFarmersLoading } = useUsersByIds(pendingFarmerIds);

    const planType = dealer?.planType || 'free';
    const [isConnectDialogOpen, setConnectDialogOpen] = useState(false);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

    const farmerLimit = 2;
    const canAddMoreFarmers = planType === 'premium' || connectedFarmers.length < farmerLimit;
    const loading = !dealer || connectionsLoading || connectedFarmersLoading || pendingFarmersLoading;

    const handleConnectClick = () => {
        if (canAddMoreFarmers) {
            setConnectDialogOpen(true);
        } else {
            setShowUpgradeAlert(true);
        }
    };
    
    const handleConnectionAction = async (connectionId: string, status: 'Approved' | 'Rejected') => {
        if (!firestore) return;
        try {
            await updateConnectionStatus(firestore, connectionId, status);
            toast({
                title: `Request ${status}`,
                description: `The connection request has been ${status.toLowerCase()}.`
            });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <>
            <PageHeader
                title="My Farmers"
                description="Manage your network of connected farmers and pending requests."
            >
                <Button onClick={handleConnectClick}>
                    <PlusCircle className="mr-2" />
                    Connect New Farmer
                </Button>
            </PageHeader>
            
            {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}

            {!loading && (
                <div className="mt-8 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Connection Requests</CardTitle>
                        <CardDescription>Farmers who have sent you a connection request.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Farmer Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Requested On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingConnections.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No pending requests.</TableCell></TableRow>}
                                {pendingConnections.map(conn => {
                                    const farmer = pendingFarmers.find(f => f.id === conn.farmerUID);
                                    if (!farmer) return null;
                                    return (
                                        <TableRow key={conn.id}>
                                            <TableCell className="font-medium">{farmer.name}</TableCell>
                                            <TableCell>{farmer.email}</TableCell>
                                            <TableCell>{new Date(conn.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleConnectionAction(conn.id, 'Approved')}>
                                                    <CheckCircle className="mr-2" /> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleConnectionAction(conn.id, 'Rejected')}>
                                                     <XCircle className="mr-2" /> Reject
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

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
                                    <TableHead>Connected Since</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {connectedFarmers.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No farmers connected yet.</TableCell></TableRow>}
                                {connectedFarmers.map((farmer) => (
                                    <TableRow key={farmer.id}>
                                        <TableCell className="font-medium">{farmer.name}</TableCell>
                                        <TableCell>{farmer.email}</TableCell>
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
            )}


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
