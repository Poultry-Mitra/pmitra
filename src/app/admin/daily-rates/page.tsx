// src/app/admin/daily-rates/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Loader2 } from "lucide-react";
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { addAuditLog } from '@/hooks/use-audit-logs';
import type { DailyRates } from '@/lib/types';
import indianStates from '@/lib/indian-states-districts.json';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const formSchema = z.object({
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    readyBirdSmall: z.coerce.number().min(0, "Rate must be non-negative"),
    readyBirdMedium: z.coerce.number().min(0, "Rate must be non-negative"),
    readyBirdBig: z.coerce.number().min(0, "Rate must be non-negative"),
    chickRate: z.coerce.number().min(0, "Rate must be non-negative"),
    feedCostIndex: z.coerce.number().min(0, "Index must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;


function RateHistory() {
    const firestore = useFirestore();

    const ratesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'dailyRates'), orderBy('lastUpdated', 'desc'), limit(30));
    }, [firestore]);

    const { data: rates, isLoading } = useCollection<DailyRates>(ratesQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rate Update History</CardTitle>
                <CardDescription>Showing the last 30 daily rate updates.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Ready Bird (Med)</TableHead>
                            <TableHead className="text-right">Chick Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && (!rates || rates.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No rate history found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && rates && rates.map(rate => (
                            <TableRow key={rate.id}>
                                <TableCell>{format(new Date(rate.lastUpdated), 'PPP')}</TableCell>
                                <TableCell>{rate.location.district}, {rate.location.state}</TableCell>
                                <TableCell className="text-right">₹{rate.readyBird.medium}</TableCell>
                                <TableCell className="text-right">₹{rate.chickRate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function DailyRateManagementPage() {
    const { toast } = useToast();
    const [lastUpdated, setLastUpdated] = useState('');
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();
    const adminUser = useUser();
    const [districts, setDistricts] = useState<string[]>([]);


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            state: "Maharashtra",
            district: "Pune",
            readyBirdSmall: 110,
            readyBirdMedium: 125,
            readyBirdBig: 140,
            chickRate: 35,
            feedCostIndex: 45.5,
        },
    });

    const selectedState = form.watch("state");

    useEffect(() => {
        if (selectedState) {
            const stateData = indianStates.states.find(s => s.state === selectedState);
            setDistricts(stateData ? stateData.districts : []);
            form.setValue("district", "");
        } else {
            setDistricts([]);
        }
    }, [selectedState, form]);
    
    const today = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const ratesDocRef = doc(firestore, 'dailyRates', today);

        const unsubscribe = onSnapshot(ratesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as DailyRates;
                const stateData = indianStates.states.find(s => s.state === data.location.state);
                if (stateData) {
                    setDistricts(stateData.districts);
                }
                form.reset({
                    state: data.location.state,
                    district: data.location.district,
                    readyBirdSmall: data.readyBird.small,
                    readyBirdMedium: data.readyBird.medium,
                    readyBirdBig: data.readyBird.big,
                    chickRate: data.chickRate,
                    feedCostIndex: data.feedCostIndex,
                });
                if (data.lastUpdated) {
                    setLastUpdated(new Date(data.lastUpdated).toLocaleString());
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, today, form]);


    async function onSubmit(values: FormValues) {
        if (!firestore || !adminUser.user) {
            toast({ title: "Error", description: "You must be an admin to perform this action.", variant: "destructive" });
            return;
        }

        const dailyRateData = {
            location: {
                state: values.state,
                district: values.district,
            },
            readyBird: {
                small: values.readyBirdSmall,
                medium: values.readyBirdMedium,
                big: values.readyBirdBig,
            },
            chickRate: values.chickRate,
            feedCostIndex: values.feedCostIndex,
            lastUpdated: new Date().toISOString(),
        };

        const ratesDocRef = doc(firestore, 'dailyRates', today);
        
        try {
            await setDoc(ratesDocRef, dailyRateData, { merge: true });
            
            await addAuditLog(firestore, {
                adminUID: adminUser.user.uid,
                action: 'UPDATE_DAILY_RATES',
                timestamp: new Date().toISOString(),
                details: `Updated daily rates for ${values.district}, ${values.state}.`,
            });
            
            toast({
                title: "Rates Updated",
                description: `Daily rates for ${today} have been successfully updated.`,
            });
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error("Error updating daily rates:", error);
            toast({ title: "Error", description: "Failed to update daily rates.", variant: "destructive" });
        }
    }

    if (loading) {
        return (
            <>
                <PageHeader title="Daily Rate Management" description="Update daily market rates for poultry products." />
                <div className="flex justify-center items-center mt-8">
                    <Loader2 className="animate-spin" />
                </div>
            </>
        )
    }

    return (
        <>
            <PageHeader title="Daily Rate Management" description="Update daily market rates for poultry products." />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Market Rates for {today}</CardTitle>
                            <CardDescription>
                                Set the rates for today. This will be visible to all premium users.
                                {lastUpdated && ` Last updated: ${lastUpdated}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a state" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {indianStates.states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="district"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>District</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a district" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Ready Bird Rate (₹/kg)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="readyBirdSmall"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Small</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="readyBirdMedium"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Medium</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="readyBirdBig"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Big</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="chickRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Chick Rate (₹/chick)</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="feedCostIndex"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Feed Cost Index</FormLabel>
                                                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                </div>
                                    
                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <IndianRupee className="mr-2" />}
                                        {form.formState.isSubmitting ? "Updating..." : "Update Rates for Today"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <RateHistory />
                </div>
            </div>
        </>
    );
}
