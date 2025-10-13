
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
import { useAppUser } from "@/app/app-provider";
import { ConnectDealerDialog } from './_components/connect-dealer-dialog';
import { PendingOrders } from './_components/pending-orders';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';


export default function DashboardPage() {
  const { user, loading: userLoading } = useAppUser();
  const [isConnectDealerOpen, setConnectDealerOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { batches, loading: batchesLoading } = useBatches(user?.id || "");
  
  const loading = userLoading || !user;

  const poultryMitraId = useMemo(() => 
    user ? `PM-FARM-${user.id.substring(0, 5).toUpperCase()}` : '',
  [user]);

  const activeBatches = useMemo(() => 
    batches.filter(b => b.status === 'Active'),
  [batches]);

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

        <div className="flex items-center gap-4">
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

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PendingOrders />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.performance.title')}</CardTitle>
            <CardDescription>{t('dashboard.performance.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionChart data={mockFarmMetrics} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.ai_suggestions.title')}</CardTitle>
            <CardDescription>{t('dashboard.ai_suggestions.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {batchesLoading ? (
                 <div className="text-center text-sm text-muted-foreground p-4">
                    <Loader2 className="animate-spin mr-2 inline-block" />
                    {t('messages.loading_ai_data')}
                 </div>
            ) : farmDataForAISuggestions ? (
              <AISuggestions farmData={farmDataForAISuggestions} />
            ) : (
              <div className="text-center text-sm text-muted-foreground p-4">
                {t('messages.add_batch_for_ai')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ConnectDealerDialog open={isConnectDealerOpen} onOpenChange={setConnectDealerOpen} />
    </>
  );
}
