
// src/app/(app)/analytics/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from "../(app)/_components/page-header";
import { useBatches } from '@/hooks/use-batches';
import { getFarmAnalytics } from '@/ai/flows/get-farm-analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bird, Droplet, Percent, Wheat, WandSparkles, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useAppUser } from '@/app/app-provider';
import { z } from 'zod';

const FarmAnalyticsOutputSchema = z.object({
  totalLiveBirds: z.number(),
  overallMortalityRate: z.number(),
  totalFeedConsumed: z.number(),
  averageFCR: z.number(),
  summary: z.string(),
});
type FarmAnalyticsOutput = z.infer<typeof FarmAnalyticsOutputSchema>;


function StatCard({ title, value, icon: Icon, unit }: { title: string, value: string | number, icon: React.ElementType, unit?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value}
                    {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                    </CardContent>
                </Card>
            ))}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function AnalyticsPage() {
    const { user: appUser, loading: appUserLoading } = useAppUser();
    const { batches, loading: batchesLoading } = useBatches(appUser?.id || '');
    const [analytics, setAnalytics] = useState<FarmAnalyticsOutput | null>(null);
    const [loading, setLoading] = useState(true);

    const activeBatches = useMemo(() => batches.filter(b => b.status === 'Active'), [batches]);

    useEffect(() => {
        async function fetchAnalytics() {
            if (appUserLoading || batchesLoading) {
                setLoading(true);
                return;
            }
             if (activeBatches.length === 0) {
                setAnalytics({
                    totalLiveBirds: 0,
                    overallMortalityRate: 0,
                    totalFeedConsumed: 0,
                    averageFCR: 0,
                    summary: "No active batches found. Add a batch to see your farm's analytics.",
                });
                 setLoading(false);
                return;
            }

            try {
                const result = await getFarmAnalytics({ batches: activeBatches });
                setAnalytics(result);
            } catch (error) {
                console.error("Failed to fetch farm analytics", error);
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [activeBatches, appUserLoading, batchesLoading]);

  return (
    <>
      <PageHeader 
        title="Farm Analytics"
        description="An AI-powered overview of your active batches."
      />
      <div className="mt-8">
        {loading ? (
             <LoadingState />
        ) : analytics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Live Birds" value={analytics.totalLiveBirds.toLocaleString()} icon={Bird} />
                <StatCard title="Overall Mortality Rate" value={`${analytics.overallMortalityRate.toFixed(2)}%`} icon={Percent} />
                <StatCard title="Total Feed Consumed" value={`${analytics.totalFeedConsumed.toLocaleString()} kg`} icon={Wheat} />
                <StatCard title="Average FCR" value={analytics.averageFCR.toFixed(2)} icon={Droplet} />

                <Card className="md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WandSparkles className="text-primary" />
                            AI-Powered Summary
                        </CardTitle>
                        <CardDescription>An analysis of your farm's current status based on active batch data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{analytics.summary}</p>
                    </CardContent>
                </Card>
            </div>
        ) : (
            <div className="text-center text-muted-foreground">
                Could not load analytics data. Please try again later.
            </div>
        )}
      </div>
    </>
  );
}
