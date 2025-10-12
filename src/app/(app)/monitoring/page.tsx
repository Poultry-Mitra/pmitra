
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSensorData, mockHistoricalData } from "@/lib/data";
import type { FarmAlert } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Siren, Thermometer, Droplets, Wind } from 'lucide-react';
import { AIForecast } from "./_components/ai-forecast";

export default function MonitoringPage() {
    const [alerts, setAlerts] = useState<FarmAlert[]>([]);

    useEffect(() => {
        // Mock alerts for demonstration
        setAlerts([
            { id: 'alert-1', type: 'critical', message: 'High ammonia levels detected in Coop B-2. Immediate ventilation required.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: 'alert-2', type: 'warning', message: 'Humidity dropping in Coop A-1. Check water supply.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        ]);
    }, []);

    return (
        <>
            <PageHeader
                title="Farm Monitoring"
                description="Real-time sensor data and critical alerts from your farm."
            />
            
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                     <h2 className="font-headline text-xl font-semibold mb-4">Live Sensor Readings</h2>
                     <div className="grid gap-4 md:grid-cols-2">
                        {mockSensorData.map(sensor => (
                            <Card key={sensor.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{sensor.location}</CardTitle>
                                        <div className="flex items-center gap-1 text-xs text-green-500">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            Live
                                        </div>
                                    </div>
                                    <CardDescription>Last updated: a few seconds ago</CardDescription>
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
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="font-headline text-xl font-semibold">Active Alerts</h2>
                    {alerts.map(alert => (
                         <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                            {alert.type === 'critical' ? <Siren className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <AlertTitle>{alert.type === 'critical' ? 'Critical Alert' : 'Warning'}</AlertTitle>
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    ))}
                    {alerts.length === 0 && <p className="text-sm text-muted-foreground">No active alerts.</p>}
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
                       <AIForecast
                        sensorData={JSON.stringify(mockSensorData, null, 2)}
                        historicalData={JSON.stringify(mockHistoricalData, null, 2)}
                       />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
