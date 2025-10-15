// src/app/(app)/batches/[batchId]/page.tsx
"use client";

import { useState, memo } from "react";
import dynamic from 'next/dynamic';
import { useParams } from "next/navigation";
import { useBatch, useDailyRecords } from "@/hooks/use-batches";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bird, Droplet, Percent, Scale, Wheat, IndianRupee, Loader2, AlertCircle, PlusCircle, Thermometer, ShieldCheck } from "lucide-react";
import { AddDailyRecordDialog } from "./_components/add-daily-record-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Dynamically import the charts component to reduce initial bundle size
const BatchCharts = dynamic(
  () => import('./_components/batch-charts').then(mod => mod.BatchCharts),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center p-4 h-64">
        <Loader2 className="animate-spin mr-2" /> Loading charts...
      </div>
    )
  }
);

const StatCard = memo(function StatCard({ title, value, icon: Icon, unit }: { title: string, value: string | number, icon: React.ElementType, unit?: string }) {
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
});

const vaccinationSchedule = [
  { day: 'Day 1', vaccine: "Marek's Disease", method: 'Injection (at hatchery)', status: 'Done' },
  { day: 'Day 7', vaccine: 'Ranikhet (LaSota/F-strain)', method: 'Eye Drop / Drinking Water', status: 'Pending' },
  { day: 'Day 14', vaccine: 'Gumboro (IBD) - Mild Strain', method: 'Eye Drop / Drinking Water', status: 'Pending' },
  { day: 'Day 21', vaccine: 'Ranikhet (LaSota) - Booster', method: 'Drinking Water', status: 'Pending' },
  { day: 'Day 28', vaccine: 'Gumboro (IBD) - Booster', method: 'Drinking Water', status: 'Pending' },
];


export default function BatchDetailPage() {
    const params = useParams();
    const batchId = params.batchId as string;
    const { batch, loading: batchLoading } = useBatch(batchId);
    const { records, loading: recordsLoading } = useDailyRecords(batchId);
    const [isAddRecordOpen, setAddRecordOpen] = useState(false);

    if (batchLoading) {
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
    const mortalityPercentage = batch.totalChicks > 0 ? ((batch.mortalityCount / batch.totalChicks) * 100).toFixed(2) : '0.00';
    
    const INITIAL_CHICK_WEIGHT_G = 40;
    const totalWeightGainKg = liveBirds > 0 ? (liveBirds * (batch.avgBodyWeight - INITIAL_CHICK_WEIGHT_G)) / 1000 : 0;

    const feedConversionRatio = (batch.feedConsumed > 0 && totalWeightGainKg > 0)
        ? (batch.feedConsumed / totalWeightGainKg).toFixed(2)
        : '0.00';
    
    const ageInMs = new Date().getTime() - new Date(batch.batchStartDate).getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    const getIdealTemp = (days: number) => {
        if (days <= 2) return 35;
        if (days <= 7) return 32;
        if (days <= 14) return 29;
        if (days <= 21) return 26;
        if (days <= 28) return 24;
        return 22;
    }
    const idealTemp = getIdealTemp(ageInDays);


    return (
        <>
            <PageHeader
                title={batch.batchName}
                description={`Details for ${batch.batchType} batch started on ${new Date(batch.batchStartDate).toLocaleDateString()}`}
            >
                <Button onClick={() => setAddRecordOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Add Daily Record
                </Button>
            </PageHeader>
            
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <StatCard title="Live Birds" value={liveBirds.toLocaleString()} icon={Bird} />
                <StatCard title="Mortality" value={`${mortalityPercentage}`} unit="%" icon={Percent} />
                <StatCard title="Avg. Body Weight" value={batch.avgBodyWeight} unit="g" icon={Scale} />
                <StatCard title="Today's Ideal Temp" value={idealTemp} unit="°C" icon={Thermometer} />
                <StatCard title="FCR" value={feedConversionRatio} icon={Droplet} />
                <StatCard title="Feed Consumed" value={batch.feedConsumed.toFixed(2)} unit="kg" icon={Wheat} />
            </div>

            <div className="mt-8">
                 <Card>
                    <Tabs defaultValue="analytics" className="w-full">
                         <CardHeader>
                            <CardTitle>Batch Details</CardTitle>
                            <div className="flex justify-between items-end">
                                <CardDescription>Visualizing trends, health records, and daily data for this batch.</CardDescription>
                                <TabsList>
                                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                    <TabsTrigger value="records">Daily Records</TabsTrigger>
                                    <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
                                </TabsList>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <TabsContent value="analytics">
                                <BatchCharts data={[...records].reverse()} />
                           </TabsContent>
                           <TabsContent value="records">
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Medication/Vaccine</TableHead>
                                            <TableHead>Notes/Observations</TableHead>
                                            <TableHead className="text-right">Mortality</TableHead>
                                            <TableHead className="text-right">Feed Consumed (kg)</TableHead>
                                            <TableHead className="text-right">Avg. Weight (g)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recordsLoading && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">
                                                    <div className="flex justify-center items-center p-4">
                                                        <Loader2 className="animate-spin mr-2" /> Loading records...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!recordsLoading && records.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center p-8">
                                                    No daily records found. Click "Add Daily Record" to get started.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!recordsLoading && records.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                                                <TableCell>{record.medicationGiven || '—'}</TableCell>
                                                <TableCell className="max-w-xs truncate">{record.notes || '—'}</TableCell>
                                                <TableCell className="text-right">{record.mortality}</TableCell>
                                                <TableCell className="text-right">{record.feedConsumed.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{record.avgBodyWeight}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                               </Table>
                           </TabsContent>
                           <TabsContent value="vaccination">
                               <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Recommended Day</TableHead>
                                        <TableHead>Vaccine / Treatment</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vaccinationSchedule.map(item => (
                                        <TableRow key={item.vaccine}>
                                            <TableCell className="font-medium">{item.day}</TableCell>
                                            <TableCell>{item.vaccine}</TableCell>
                                            <TableCell>{item.method}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'Done' ? 'default' : 'secondary'}>{item.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                               </Table>
                           </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
            <AddDailyRecordDialog open={isAddRecordOpen} onOpenChange={setAddRecordOpen} batchId={batchId} />
        </>
    );
}
