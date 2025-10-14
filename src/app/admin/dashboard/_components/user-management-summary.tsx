// src/app/(app)/dashboard/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Link as LinkIcon, Download, CheckCircle, XCircle } from "lucide-react";
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


function DealerConnectionRequests() {
    const { user: appUser, loading: appUserLoading } = useAppUser();
    const { connections, loading: connectionsLoading } = useConnections(appUser?.id, 'farmer');
    const firestore = useFirestore();
    const auth = useAuth();
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
        if (!firestore || !auth) return;
        try {
            await updateConnectionStatus(firestore, auth, connectionId, status);
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
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{t('dashboard.welcome', { name: user.name.split(' ')[0] })} 👋</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{poultryMitraId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyId}>
                    <Copy className="size-3" />
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
            <Badge className="capitalize" variant={user.planType === 'premium' ? 'default' : 'secondary'}>{t(`plans.${user.planType}`)}</Badge>
             {user.role === 'farmer' && (
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setConnectDealerOpen(true)}>
                    <LinkIcon className="mr-2" />
                    {t('dashboard.connect_dealer')}
                </Button>
             )}
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats batches={activeBatches} loading={batchesLoading} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8">
        <DealerConnectionRequests />
        <PendingOrders />
      </div>
      <ConnectDealerDialog open={isConnectDealerOpen} onOpenChange={setConnectDealerOpen} />
    </>
  );
}