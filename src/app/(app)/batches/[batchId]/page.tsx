"use client";

import { useParams } from "next/navigation";
import { useBatch } from "@/hooks/use-batches";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bird, Droplet, Percent, Scale, Wheat, IndianRupee, Loader2, AlertCircle } from "lucide-react";

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

export default function BatchDetailPage() {
    const params = useParams();
    const batchId = params.batchId as string;
    const { batch, loading } = useBatch(batchId);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-4">Loading Batch Details...</span>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="flex flex-col h-64 items-center justify-center text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-semibold">Batch Not Found</h2>
                <p className="text-muted-foreground">The requested batch could not be found.</p>
                 <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }
    
    const liveBirds = batch.totalChicks - batch.mortalityCount;
    const mortalityPercentage = batch.totalChicks > 0 ? ((batch.mortalityCount / batch.totalChicks) * 100).toFixed(2) : 0;
    const feedConversionRatio = liveBirds > 0 && batch.avgBodyWeight > 0 ? (batch.feedConsumed * 1000 / (liveBirds * batch.avgBodyWeight)).toFixed(2) : 'N/A';


    return (
        <>
            <PageHeader
                title={batch.batchName}
                description={`Details for ${batch.batchType} batch started on ${new Date(batch.batchStartDate).toLocaleDateString()}`}
            >
                <Button>Edit Batch</Button>
            </PageHeader>
            
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard title="Live Birds" value={liveBirds.toLocaleString()} icon={Bird} />
                <StatCard title="Mortality" value={`${mortalityPercentage}`} unit="%" icon={Percent} />
                <StatCard title="Avg. Body Weight" value={batch.avgBodyWeight} unit="g" icon={Scale} />
                <StatCard title="Feed Consumed" value={batch.feedConsumed} unit="kg" icon={Wheat} />
                <StatCard title="FCR" value={feedConversionRatio} icon={Droplet} />
                <StatCard title="Est. Profit" value="--" icon={IndianRupee} />
            </div>

            <div className="mt-8">
                {/* Placeholder for future charts and tables */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Daily mortality, feed consumption, and weight records will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
