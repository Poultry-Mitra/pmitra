import { PageHeader } from "../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSensorData, mockAlerts, mockHistoricalData } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Siren, Thermometer, Droplets, Wind } from 'lucide-react';
import { AIForecast } from "./_components/ai-forecast";

export default function MonitoringPage() {
    return (
        <>
            <PageHeader
                title="Farm Monitoring"
                description="Real-time sensor data and critical alerts from your farm."
            />
            
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                     <h2 className="font-headline text-xl font-semibold mb-4">Live Sensor Readings</h2>
                     <div className="grid gap-4 md:grid-cols-2">
                        {mockSensorData.map(sensor => (
                            <Card key={sensor.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{sensor.location}</CardTitle>
                                    <CardDescription>Last updated: a few seconds ago</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="size-4 text-muted-foreground" />
                                        <span>{sensor.temperature}°C</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Droplets className="size-4 text-muted-foreground" />
                                        <span>{sensor.humidity}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
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
                    {mockAlerts.map(alert => (
                         <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                            {alert.type === 'critical' ? <Siren className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <AlertTitle>{alert.type === 'critical' ? 'Critical Alert' : 'Warning'}</AlertTitle>
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    ))}
                    {mockAlerts.length === 0 && <p className="text-sm text-muted-foreground">No active alerts.</p>}
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
