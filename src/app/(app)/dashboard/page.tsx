
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockFarmMetrics, mockUsers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { FileDown, Plus, Copy, Zap, Loader2 } from "lucide-react";
import { ProductionChart } from "./_components/production-chart";
import { AISuggestions } from "./_components/ai-suggestions";
import { Badge } from "@/components/ui/badge";
import { useBatches } from "@/hooks/use-batches";
import { DashboardStats } from "./_components/DashboardStats";
import { useUser } from "@/firebase/provider";
import { useClientState } from "@/hooks/use-client-state";
import type { User } from "@/lib/types";
import { PendingOrders } from "./_components/pending-orders";

export default function DashboardPage() {
  const firebaseUser = useUser();
  const user = useClientState<User | undefined>(mockUsers.find(u => u.role === 'farmer'), undefined);
  
  const { batches, loading: batchesLoading } = useBatches(firebaseUser?.uid || "");
  
  if (!user || !firebaseUser) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin size-8" /></div>;

  const poultryMitraId = `PM-FARM-${firebaseUser.uid.substring(0, 5).toUpperCase()}`;

  const activeBatches = batches.filter(b => b.status === 'Active');

  const farmDataForAISuggestions = activeBatches.length > 0 ? {
      productionRate: 90, // This would be calculated from layer batches if they existed
      mortalityRate: (activeBatches.reduce((acc, b) => acc + b.mortalityCount, 0) / activeBatches.reduce((acc, b) => acc + b.totalChicks, 0)) * 100,
      feedConsumption: activeBatches.reduce((acc, b) => {
        const liveBirds = b.totalChicks - b.mortalityCount;
        if(liveBirds <= 0) return acc;
        const ageInDays = (new Date().getTime() - new Date(b.batchStartDate).getTime()) / (1000 * 60 * 60 * 24);
        if(ageInDays <= 0) return acc;
        return acc + (b.feedConsumed * 1000) / liveBirds / ageInDays;
      }, 0) / activeBatches.length, // avg feed consumption in g/bird/day
      farmSize: activeBatches.reduce((acc, b) => acc + (b.totalChicks - b.mortalityCount), 0),
  } : null;


  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{poultryMitraId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Copy className="size-3" />
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Badge>Premium Plan</Badge>
             <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                <Zap className="mr-2" />
                Upgrade Plan
            </Button>
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats batches={activeBatches} loading={batchesLoading} />
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

      <div className="mt-8">
        <PendingOrders />
      </div>
    </>
  );
}
