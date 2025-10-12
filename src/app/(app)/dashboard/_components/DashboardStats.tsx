
"use client";

import { useState, useEffect } from 'react';
import { Bird, Droplet, Percent, Scale, Wheat, IndianRupee, Loader2, WandSparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFarmAnalytics } from '@/ai/flows/get-farm-analytics';
import type { Batch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { FarmAnalyticsOutput } from '@/ai/flows/get-farm-analytics';

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
        <>
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-3 w-1/3 mt-1" />
                    </CardContent>
                </Card>
            ))}
             <Card className="lg:col-span-4">
                <CardHeader>
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
        </>
    );
}


export function DashboardStats({ batches, loading: batchesLoading }: { batches: Batch[], loading: boolean }) {
    const [analytics, setAnalytics] = useState<FarmAnalyticsOutput | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            if (batchesLoading) {
                setLoading(true);
                return;
            }
            try {
                const result = await getFarmAnalytics({ batches });
                setAnalytics(result);
            } catch (error) {
                console.error("Failed to fetch farm analytics", error);
                setAnalytics(null); // Or set an error state
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [batches, batchesLoading]);

    if (loading) {
        return <LoadingState />;
    }

    if (!analytics) {
        return <p>Could not load farm analytics.</p>;
    }

    return (
        <>
            <StatCard title="Total Live Birds" value={analytics.totalLiveBirds.toLocaleString()} icon={Bird} description="Across all active batches" />
            <StatCard title="Overall Mortality" value={analytics.overallMortalityRate.toFixed(2)} unit="%" icon={Percent} description="Weighted average" />
            <StatCard title="Total Feed Consumed" value={analytics.totalFeedConsumed.toLocaleString()} unit="kg" icon={Wheat} description="Across all batches" />
            <StatCard title="Average FCR" value={analytics.averageFCR.toFixed(2)} icon={Droplet} description="Feed Conversion Ratio" />
            <Card className="lg:col-span-4">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <WandSparkles className="text-primary" />
                        AI Farm Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {analytics.summary}
                    </p>
                </CardContent>
            </Card>
        </>
    );
}
