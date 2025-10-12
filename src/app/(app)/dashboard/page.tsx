
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockFarmMetrics } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Link as LinkIcon } from "lucide-react";
import { ProductionChart } from "./_components/production-chart";
import { AISuggestions } from "./_components/ai-suggestions";
import { Badge } from "@/components/ui/badge";
import { useBatches } from "@/hooks/use-batches";
import { DashboardStats } from "./_components/DashboardStats";
import { useUser, useFirestore } from "@/firebase/provider";
import type { User } from "@/lib/types";
import { ConnectDealerDialog } from './_components/connect-dealer-dialog';
import { PendingOrders } from './_components/pending-orders';
import { doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const firebaseUser = useUser();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isConnectDealerOpen, setConnectDealerOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!firestore || !firebaseUser?.uid) return;
    const unsub = onSnapshot(doc(firestore, 'users', firebaseUser.uid), (doc) => {
        if (doc.exists()) {
            setUser(doc.data() as User);
        }
    });
    return () => unsub();
  }, [firestore, firebaseUser?.uid]);

  
  const { batches, loading: batchesLoading } = useBatches(firebaseUser?.uid || "");
  
  if (!user || !firebaseUser) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin size-8" /></div>;

  const poultryMitraId = `PM-FARM-${firebaseUser.uid.substring(0, 5).toUpperCase()}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(poultryMitraId);
    toast({ title: "Copied!", description: "Your PoultryMitra Farmer ID has been copied." });
  }

  const activeBatches = batches.filter(b => b.status === 'Active');

  const farmDataForAISuggestions = useMemo(() => {
      if (activeBatches.length === 0) return null;

      const totalInitialChicks = activeBatches.reduce((acc, b) => acc + b.totalChicks, 0);
      const totalMortality = activeBatches.reduce((acc, b) => acc + b.mortalityCount, 0);
      const liveBirds = totalInitialChicks - totalMortality;
      const totalFeedConsumed = activeBatches.reduce((acc, b) => acc + b.feedConsumed, 0);
      
      const overallMortalityRate = totalInitialChicks > 0 ? (totalMortality / totalInitialChicks) * 100 : 0;
      const avgFeedConsumptionPerBirdPerDay = liveBirds > 0 ? (totalFeedConsumed * 1000) / liveBirds / 30 : 0; // rough estimate over 30 days

      return {
          productionRate: 0, // Assuming broiler, so production rate is 0.
          mortalityRate: overallMortalityRate,
          feedConsumption: avgFeedConsumptionPerBirdPerDay,
          farmSize: liveBirds,
      };
  }, [activeBatches]);


  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{poultryMitraId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyId}>
                    <Copy className="size-3" />
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Badge className="capitalize" variant={user.planType === 'premium' ? 'default' : 'secondary'}>{user.planType} Plan</Badge>
             <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setConnectDealerOpen(true)}>
                <LinkIcon className="mr-2" />
                Connect to Dealer
            </Button>
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats batches={activeBatches} loading={batchesLoading} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PendingOrders />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Farm Performance Overview</CardTitle>
            <CardDescription>Monthly trends for key farm metrics (mock data).</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionChart data={mockFarmMetrics} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>AI-Powered Suggestions</CardTitle>
            <CardDescription>Get suggestions to improve farm efficiency.</CardDescription>
          </CardHeader>
          <CardContent>
            {batchesLoading ? (
                 <div className="text-center text-sm text-muted-foreground p-4">
                    <Loader2 className="animate-spin mr-2 inline-block" />
                    Loading data for AI...
                 </div>
            ) : farmDataForAISuggestions ? (
              <AISuggestions farmData={farmDataForAISuggestions} />
            ) : (
              <div className="text-center text-sm text-muted-foreground p-4">
                Add an active batch to get AI suggestions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ConnectDealerDialog open={isConnectDealerOpen} onOpenChange={setConnectDealerOpen} />
    </>
  );
}
