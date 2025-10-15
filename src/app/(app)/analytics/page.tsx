
// src/app/(app)/analytics/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from "../_components/page-header";
import { useBatches } from '@/hooks/use-batches';
import { getFarmAnalytics, type FarmAnalyticsOutput } from '@/ai/flows/get-farm-analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bird, Droplet, Percent, Wheat, WandSparkles, Activity } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useAppUser } from '@/app/app-provider';

function StatCard({ title, value, icon: Icon, unit, description }: { title: string, value: string | number, icon: React.ElementType, unit?: string, description?: string }) {
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
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
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
                        <Skeleton className="h-8 w-1/2 mt-2" />
                         <Skeleton className="h-3 w-3/4 mt-2" />
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
    // Fetch ALL batches (active and completed) for a full analysis
    const { batches, loading: batchesLoading } = useBatches(appUser?.id || ''); 
    const [analytics, setAnalytics] = useState<FarmAnalyticsOutput | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            if (appUserLoading || batchesLoading) {
                setLoading(true);
                return;
            }
             if (batches.length === 0) {
                setAnalytics({
                    totalLiveBirds: 0,
                    overallMortalityRate: 0,
                    totalFeedConsumed: 0,
                    averageFCR: 0,
                    summary: "No batch data found. Add a batch to see your farm's analytics.",
                });
                 setLoading(false);
                return;
            }

            try {
                const result = await getFarmAnalytics({ batches: batches });
                setAnalytics(result);
            } catch (error) {
                console.error("Failed to fetch farm analytics", error);
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [batches, appUserLoading, batchesLoading]);

  return (
    <>
      <PageHeader 
        title="Farm Performance Analytics"
        description="An AI-powered overview of your farm's performance across all batches."
      />
      <div className="mt-8">
        {loading ? (
             <LoadingState />
        ) : analytics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Live Birds" value={analytics.totalLiveBirds.toLocaleString()} icon={Bird} description="In active batches" />
                <StatCard title="Overall Mortality Rate" value={`${analytics.overallMortalityRate.toFixed(2)}%`} icon={Percent} description="Across all batches" />
                <StatCard title="Total Feed (Active)" value={`${analytics.totalFeedConsumed.toLocaleString()} kg`} icon={Wheat} description="Consumed by active batches" />
                <StatCard title="Overall Average FCR" value={analytics.averageFCR.toFixed(2)} icon={Droplet} description="Across all batches"/>

                <Card className="md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WandSparkles className="text-primary" />
                            AI-Powered Performance Summary
                        </CardTitle>
                        <CardDescription>An analysis of your farm's historical trends and current status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analytics.summary}</p>
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
