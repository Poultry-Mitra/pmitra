// src/app/dealer/my-farmers/page.tsx
"use client";

import { useState, useMemo } from 'react';
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
import { PlusCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useUsersByIds } from '@/hooks/use-users';
import { ConnectFarmerDialog } from './_components/connect-farmer-dialog';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { useConnections } from '@/hooks/use-connections';
import { FarmerDetailsDialog } from './_components/farmer-details-dialog';
import { useAppUser } from '@/app/app-provider';
import { useLanguage } from '@/components/language-provider';
import { Badge } from '@/components/ui/badge';

export default function MyFarmersPage() {
    const { user: dealerUser, loading: appUserLoading } = useAppUser();
    const { t } = useLanguage();
    
    const { connections, loading: connectionsLoading } = useConnections(dealerUser?.id, 'dealer');
    
    const approvedConnections = useMemo(() => connections.filter(c => c.status === 'Approved'), [connections]);

    const connectedFarmerIds = useMemo(() => approvedConnections.map(c => c.farmerUID), [approvedConnections]);

    const { users: connectedFarmers, loading: connectedFarmersLoading } = useUsersByIds(connectedFarmerIds);

    const planType = dealerUser?.planType || 'free';
    const [isConnectDialogOpen, setConnectDialogOpen] = useState(false);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<User | null>(null);

    const farmerLimit = 2;
    const canAddMoreFarmers = planType === 'premium' || connectedFarmers.length < farmerLimit;
    const loading = appUserLoading || connectionsLoading || connectedFarmersLoading;

    const handleConnectClick = () => {
        if (canAddMoreFarmers) {
            setConnectDialogOpen(true);
        } else {
            setShowUpgradeAlert(true);
        }
    };
    
    const handleViewDetails = (farmer: User) => {
        setSelectedFarmer(farmer);
    };

    return (
        <>
            <PageHeader
                title={t('dealer.my_farmers')}
                description="Manage your network of connected farmers and pending requests."
            >
                <Button onClick={handleConnectClick}>
                    <PlusCircle className="mr-2" />
                    Connect New Farmer
                </Button>
            </PageHeader>
            
            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : (
                <div className="mt-8 space-y-8">
                
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
                                    <TableHead>Location</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className='text-right'>{t('tables.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {connectedFarmers.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No farmers connected yet. Share your dealer code or use the "Connect New Farmer" button.
                                        </TableCell>
                                     </TableRow>
                                )}
                                {connectedFarmers.map((farmer) => {
                                    return (
                                    <TableRow key={farmer.id}>
                                        <TableCell className="font-medium">{farmer.name}</TableCell>
                                        <TableCell>{farmer.email}</TableCell>
                                        <TableCell>{farmer.district}, {farmer.state}</TableCell>
                                        <TableCell>
                                            <Badge variant={farmer.planType === 'premium' ? 'default' : 'secondary'} className="capitalize">{farmer.planType}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="outline" size="sm" onClick={() => handleViewDetails(farmer)}>{t('actions.view_details')}</Button>
                                        </TableCell>
                                    </TableRow>
                                )})}
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
                        <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                        <AlertDialogAction asChild>
                        <Link href="/pricing">{t('pricing.upgrade_plan')}</Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {selectedFarmer && (
                <FarmerDetailsDialog 
                    farmer={selectedFarmer}
                    open={!!selectedFarmer}
                    onOpenChange={() => setSelectedFarmer(null)}
                />
            )}
        </>
    );
}
