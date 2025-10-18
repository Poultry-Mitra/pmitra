// src/app/(app)/dashboard/page.tsx
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Link as LinkIcon, CheckCircle, XCircle, PlusCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBatches } from "@/hooks/use-batches";
import { DashboardStats } from "./_components/DashboardStats";
import { useAppUser } from "@/app/app-provider";
import { ConnectDealerDialog } from './_components/connect-dealer-dialog';
import { PendingOrders } from './_components/pending-orders';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';
import { useConnections, updateConnectionStatus } from '@/hooks/use-connections';
import { useUsersByIds } from '@/hooks/use-users';
import { useFirestore, useAuth } from '@/firebase/provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from '@/components/ui/page-header';
import { VaccinationReminders } from './_components/vaccination-reminders';
import Link from 'next/link';

function RecentBatches({ batches, loading }: { batches: ReturnType<typeof useBatches>['batches'], loading: boolean }) {
    const recentActiveBatches = useMemo(() => {
        return batches
            .filter(b => b.status === 'Active')
            .sort((a, b) => new Date(b.batchStartDate).getTime() - new Date(a.batchStartDate).getTime())
            .slice(0, 3);
    }, [batches]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Batch Activity</CardTitle>
                <CardDescription>A quick look at your most recent active batches.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
                ) : recentActiveBatches.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No active batches. Add one to get started!</p>
                ) : (
                    <div className="space-y-4">
                        {recentActiveBatches.map(batch => {
                             const ageInMs = new Date().getTime() - new Date(batch.batchStartDate).getTime();
                             const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
                            return (
                                <div key={batch.id} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                                    <div>
                                        <p className="font-semibold text-sm">{batch.batchName}</p>
                                        <p className="text-xs text-muted-foreground">Age: {ageInDays} days</p>
                                    </div>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/batches/${batch.id}`}>View Details <ArrowRight className="ml-2 size-4" /></Link>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
                 <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/batches">View All Batches</Link>
                 </Button>
            </CardContent>
        </Card>
    );
}

function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Perform common tasks with a single click.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link href="/batches">
                         <PlusCircle className="size-5" />
                         <span>Add New Batch</span>
                    </Link>
                </Button>
                 <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link href="/inventory/add">
                         <PlusCircle className="size-5" />
                         <span>Add Purchase</span>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}


function DealerConnectionRequests() {
    const { user: appUser, loading: appUserLoading } = useAppUser();
    const { connections, loading: connectionsLoading } = useConnections(appUser?.id, 'farmer');
    const firestore = useFirestore();
    const { toast } = useToast();

    const pendingRequests = useMemo(() => 
        connections.filter(c => c.status === 'Pending' && c.requestedBy === 'dealer'), 
    [connections]);

    const dealerIds = useMemo(() => pendingRequests.map(r => r.dealerUID), [pendingRequests]);
    const { users: dealers, loading: dealersLoading } = useUsersByIds(dealerIds);
    
    const loading = appUserLoading || connectionsLoading || dealersLoading;
    
    if (loading || pendingRequests.length === 0) {
        return null; // Don't show the card if there are no pending requests or still loading
    }
    
    const getDealerName = (dealerId: string) => {
        return dealers.find(d => d.id === dealerId)?.name || "Loading...";
    }

    const handleAction = async (connectionId: string, status: 'Approved' | 'Rejected') => {
        if (!firestore) return;
        try {
            await updateConnectionStatus(firestore, connectionId, status);
            toast({
                title: `Request ${status}`,
                description: "The connection has been updated."
            })
        } catch(e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    }


    return (
        <Card>
            <CardHeader>
               <CardTitle>Dealer Connection Requests</CardTitle>
               <CardDescription>Review and respond to connection requests from dealers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dealer Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{getDealerName(req.dealerUID)}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleAction(req.id, 'Approved')}>
                                        <CheckCircle className="mr-2" />
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(req.id, 'Rejected')}>
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
    )
}


export default function DashboardPage() {
  const { user, loading: userLoading } = useAppUser();
  const [isConnectDealerOpen, setConnectDealerOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { batches, loading: batchesLoading } = useBatches(user?.id);
  
  const loading = userLoading || !user;

  const poultryMitraId = useMemo(() => 
    user ? `PM-FARM-${user.id.substring(0, 5).toUpperCase()}` : '',
  [user]);

  const activeBatches = useMemo(() => 
    batches.filter(b => b.status === 'Active'),
  [batches]);

  const handleCopyId = () => {
    if (!poultryMitraId) return;
    navigator.clipboard.writeText(poultryMitraId);
    toast({ title: t('messages.copied_title'), description: t('messages.copied_desc') });
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin size-8" /></div>;

  return (
    <>
      <PageHeader title={t('dashboard.welcome', { name: user.name.split(' ')[0] })} />

      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{poultryMitraId}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyId}>
                <Copy className="size-3" />
            </Button>
        </div>
        <Badge className="capitalize" variant={user.planType === 'premium' ? 'default' : 'secondary'}>{t(`plans.${user.planType}`)}</Badge>
         {user.role === 'farmer' && (
            <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setConnectDealerOpen(true)}>
                <LinkIcon className="mr-2" />
                {t('dashboard.connect_dealer')}
            </Button>
         )}
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats batches={activeBatches} loading={batchesLoading} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <RecentBatches batches={batches} loading={batchesLoading} />
            <PendingOrders />
        </div>
        <div className="space-y-8 lg:sticky lg:top-24">
            <QuickActions />
            <VaccinationReminders batches={activeBatches} loading={batchesLoading} />
            <DealerConnectionRequests />
        </div>
      </div>
      <ConnectDealerDialog open={isConnectDealerOpen} onOpenChange={setConnectDealerOpen} />
    </>
  );
}
