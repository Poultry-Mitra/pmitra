
"use client";

import { PageHeader } from "../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Siren, Thermometer, Droplets, Wind, Loader2 } from 'lucide-react';
import { AIForecast } from "./_components/ai-forecast";
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import type { SensorData, FarmAlert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useAppUser } from "@/app/app-provider";

export default function MonitoringPage() {
    const { user, loading: appUserLoading } = useAppUser();
    const firestore = useFirestore();

    // Fetch latest sensor data (assuming one document per farm for simplicity)
    const sensorQuery = useMemoFirebase(() => firestore && user ? query(
        collection(firestore, 'farmData'),
        where('farmId', '==', user.id), // Assuming farmId is user.id for simplicity
        orderBy('timestamp', 'desc'),
        limit(4) // Fetching 4 latest readings for 4 coops
    ) : null, [firestore, user]);
    const { data: sensorData, isLoading: sensorLoading } = useCollection<SensorData>(sensorQuery);
    
    // Fetch active alerts
    const alertsQuery = useMemoFirebase(() => firestore && user ? query(
        collection(firestore, 'farmAlerts'),
        where('farmId', '==', user.id),
        where('isRead', '==', false),
        orderBy('timestamp', 'desc')
    ) : null, [firestore, user]);
    const { data: alerts, isLoading: alertsLoading } = useCollection<FarmAlert>(alertsQuery);

    // Fetch historical data for AI forecast
    const historicalQuery = useMemoFirebase(() => firestore && user ? query(
        collection(firestore, 'farmData'),
        where('farmId', '==', user.id),
        orderBy('timestamp', 'desc'),
        limit(100) // Last 100 records for historical context
    ) : null, [firestore, user]);
    const { data: historicalData, isLoading: historyLoading } = useCollection<SensorData>(historicalQuery);

    const loading = appUserLoading || sensorLoading || alertsLoading || historyLoading;

    return (
        <>
            <PageHeader
                title="Farm Monitoring"
                description="Real-time sensor data and critical alerts from your farm."
            />
            
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                     <h2 className="font-headline text-xl font-semibold mb-4">Live Sensor Readings</h2>
                     {loading ? (
                         <div className="grid gap-4 md:grid-cols-2">
                             {[...Array(4)].map((_, i) => <Card key={i} className="h-36"><CardContent className="pt-6 flex justify-center items-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>)}
                         </div>
                     ) : sensorData && sensorData.length > 0 ? (
                         <div className="grid gap-4 md:grid-cols-2">
                            {sensorData.map(sensor => (
                                <Card key={sensor.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{`Coop ${sensor.id.slice(-4)}`}</CardTitle>
                                            <div className="flex items-center gap-1 text-xs text-green-500">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                Live
                                            </div>
                                        </div>
                                        <CardDescription>Last updated: {formatDistanceToNow(new Date(sensor.timestamp), { addSuffix: true })}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                                            <Thermometer className="size-4 text-muted-foreground" />
                                            <span>{sensor.temperature}°C</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                                            <Droplets className="size-4 text-muted-foreground" />
                                            <span>{sensor.humidity}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                                            <Wind className="size-4 text-muted-foreground" />
                                            <span>{sensor.ammonia} ppm</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                         </div>
                     ) : (
                        <div className="text-center text-muted-foreground py-10">No sensor data available.</div>
                     )}
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="font-headline text-xl font-semibold">Active Alerts</h2>
                    {loading ? (
                         <Card className="h-36"><CardContent className="pt-6 flex justify-center items-center h-full"><Loader2 className="animate-spin"/></CardContent></Card>
                    ) : alerts && alerts.length > 0 ? (
                        alerts.map(alert => (
                             <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                                {alert.type === 'critical' ? <Siren className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                <AlertTitle>{alert.type === 'critical' ? 'Critical Alert' : 'Warning'}</AlertTitle>
                                <AlertDescription>{alert.message}</AlertDescription>
                            </Alert>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground pt-4 rounded-lg border bg-card p-8">No active alerts. Your farm is looking good!</div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Problem Forecast</CardTitle>
                        <CardDescription>
                            Let our AI analyze sensor and historical data to forecast potential diseases or productivity drops.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {loading ? (
                           <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>
                       ) : (
                           <AIForecast
                            sensorData={JSON.stringify(sensorData, null, 2)}
                            historicalData={JSON.stringify(historicalData, null, 2)}
                           />
                       )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
