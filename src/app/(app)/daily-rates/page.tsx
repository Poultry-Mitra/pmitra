
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDailyRates } from "@/lib/data";
import { IndianRupee, MapPin } from "lucide-react";

export default function DailyRatesPage() {
    const firstRate = mockDailyRates[0];
    const { readyBird, chickRate, feedCostIndex, lastUpdated, location } = firstRate;
    const [lastUpdatedTime, setLastUpdatedTime] = useState('');

    useEffect(() => {
        setLastUpdatedTime(new Date(lastUpdated).toLocaleTimeString());
    }, [lastUpdated]);
    
    return (
        <>
            <PageHeader
                title="Daily Market Rates"
                description="Live poultry rates, updated daily by our team."
            />

            <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="size-4" />
                <span>Showing rates for <span className="font-semibold text-foreground">{location.district}, {location.state}</span>. {lastUpdatedTime && `Last updated: ${lastUpdatedTime}`}</span>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Ready Bird Rate (₹/kg)</CardTitle>
                        <CardDescription>Live rate for ready-to-sell birds.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg border bg-secondary/30 p-4">
                            <p className="text-sm text-muted-foreground">Small</p>
                            <p className="text-3xl font-bold text-primary">{readyBird.small}</p>
                        </div>
                        <div className="rounded-lg border bg-secondary/30 p-4">
                            <p className="text-sm text-muted-foreground">Medium</p>
                            <p className="text-3xl font-bold text-primary">{readyBird.medium}</p>
                        </div>
                        <div className="rounded-lg border bg-secondary/30 p-4">
                            <p className="text-sm text-muted-foreground">Big</p>
                            <p className="text-3xl font-bold text-primary">{readyBird.big}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Chick Rate (₹/chick)</CardTitle>
                        <CardDescription>Price for day-old chicks.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center gap-2">
                        <IndianRupee className="size-8 text-primary"/>
                        <span className="text-4xl font-bold text-foreground">{chickRate}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Feed Cost Index</CardTitle>
                        <CardDescription>Represents average feed cost.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center gap-2">
                         <IndianRupee className="size-8 text-primary"/>
                        <span className="text-4xl font-bold text-foreground">{feedCostIndex}</span>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
