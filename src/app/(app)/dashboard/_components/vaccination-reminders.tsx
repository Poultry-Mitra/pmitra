
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, Syringe, Loader2 } from "lucide-react";
import type { Batch } from '@/lib/types';
import { broilerVaccinationSchedule } from '@/lib/vaccination-schedule';
import { differenceInDays, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UpcomingVaccination {
    batchId: string;
    batchName: string;
    vaccine: string;
    dueDate: Date;
    daysUntilDue: number;
}

export function VaccinationReminders({ batches, loading }: { batches: Batch[], loading: boolean }) {

    const upcomingVaccinations = useMemo((): UpcomingVaccination[] => {
        if (!batches) return [];

        const reminders: UpcomingVaccination[] = [];
        const today = new Date();

        batches.forEach(batch => {
            if (batch.status !== 'Active') return;

            const startDate = new Date(batch.batchStartDate);
            const batchAge = differenceInDays(today, startDate);

            broilerVaccinationSchedule.forEach(scheduleItem => {
                const daysUntilDue = scheduleItem.day - batchAge;

                // Show reminders for vaccines due in the next 7 days or are overdue
                if (daysUntilDue <= 7 && daysUntilDue >= -3) { // Show up to 3 days overdue
                     reminders.push({
                        batchId: batch.id,
                        batchName: batch.batchName,
                        vaccine: scheduleItem.vaccine,
                        dueDate: addDays(startDate, scheduleItem.day),
                        daysUntilDue: daysUntilDue,
                    });
                }
            });
        });
        
        // Sort by due date, soonest first
        return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    }, [batches]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Syringe className="text-primary" />
                        Upcoming Vaccinations
                    </CardTitle>
                    <CardDescription>
                       Checking schedules for your active batches...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    if(upcomingVaccinations.length === 0) {
        return null; // Don't show the card if there are no upcoming vaccinations
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Syringe className="text-primary" />
                    Upcoming Vaccinations
                </CardTitle>
                <CardDescription>
                    These tasks require your attention soon.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingVaccinations.map(item => (
                        <div key={`${item.batchId}-${item.vaccine}`} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                           <div>
                                <p className="font-semibold text-sm">{item.vaccine}</p>
                                <p className="text-xs text-muted-foreground">
                                    For batch: <Link href={`/batches/${item.batchId}`} className="text-primary hover:underline font-medium">{item.batchName}</Link>
                                </p>
                           </div>
                            <Badge variant={item.daysUntilDue < 0 ? "destructive" : "outline"} className="flex items-center gap-1.5">
                                <Calendar className="size-3" />
                                {item.daysUntilDue < 0 
                                    ? `Overdue by ${Math.abs(item.daysUntilDue)} days` 
                                    : item.daysUntilDue === 0 
                                    ? "Due today"
                                    : `In ${item.daysUntilDue} days`
                                }
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
