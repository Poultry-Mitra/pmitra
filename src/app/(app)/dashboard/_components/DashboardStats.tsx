
"use client";

import { useState, useEffect } from 'react';
import { Bird, Droplet, Percent, Scale, Wheat, IndianRupee, Loader2, WandSparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFarmAnalytics } from '@/ai/flows/get-farm-analytics';
import type { Batch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { FarmAnalyticsOutput } from '@/ai/flows/get-farm-analytics';
import { useLanguage } from '@/components/language-provider';

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
    const { t } = useLanguage();

    useEffect(() => {
        async function fetchAnalytics() {
            if (batchesLoading) {
                setLoading(true);
                return;
            }
            
            const activeBatches = batches.filter(b => b.status === 'Active');

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

            setLoading(true);
            try {
                const result = await getFarmAnalytics({ batches: activeBatches });
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

    if (loading || batchesLoading) {
        return <LoadingState />;
    }

    if (!analytics) {
        return <p>{t('messages.analytics_error')}</p>;
    }

    return (
        <>
            <StatCard title={t('dashboard.stats.live_birds')} value={analytics.totalLiveBirds.toLocaleString()} icon={Bird} description={t('dashboard.stats.live_birds_desc')} />
            <StatCard title={t('dashboard.stats.mortality')} value={analytics.overallMortalityRate.toFixed(2)} unit="%" icon={Percent} description={t('dashboard.stats.mortality_desc')} />
            <StatCard title={t('dashboard.stats.feed_consumed')} value={analytics.totalFeedConsumed.toLocaleString()} unit="kg" icon={Wheat} description={t('dashboard.stats.feed_consumed_desc')} />
            <StatCard title={t('dashboard.stats.fcr')} value={analytics.averageFCR.toFixed(2)} icon={Droplet} description={t('dashboard.stats.fcr_desc')} />
            <Card className="lg:col-span-4">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <WandSparkles className="text-primary" />
                        {t('dashboard.stats.ai_summary')}
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
