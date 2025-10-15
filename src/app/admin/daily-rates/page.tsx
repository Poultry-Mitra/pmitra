// src/app/admin/daily-rates/page.tsx
"use client";

import { useState, useEffect, useMemo, useContext } from 'react';
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
import { IndianRupee, Loader2, Calendar as CalendarIcon, Save } from "lucide-react";
import { useFirestore, useMemoFirebase, AuthContext } from '@/firebase/provider';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { addAuditLog } from '@/hooks/use-audit-logs';
import type { DailyRates } from '@/lib/types';
import indianStates from '@/lib/indian-states-districts.json';
import { useDailyRatesHistory } from '@/hooks/use-content';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';


const formSchema = z.object({
    date: z.date(),
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
    const { rates, loading: isLoading } = useDailyRatesHistory();

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
                        {!isLoading && rates && rates.map((rate: any) => (
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
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();
    const { user: adminUser } = useContext(AuthContext)!;
    const [districts, setDistricts] = useState<string[]>([]);


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
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
    const selectedDate = form.watch("date");

    useEffect(() => {
        if (selectedState) {
            const stateData = indianStates.states.find(s => s.state === selectedState);
            setDistricts(stateData ? stateData.districts : []);
        } else {
            setDistricts([]);
        }
    }, [selectedState]);
    
    useEffect(() => {
        if (!firestore || !selectedDate) return;

        setLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const ratesDocRef = doc(firestore, 'dailyRates', dateString);

        const unsubscribe = onSnapshot(ratesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as DailyRates;
                const stateData = indianStates.states.find(s => s.state === data.location.state);
                if (stateData) {
                    setDistricts(stateData.districts);
                }
                form.reset({
                    date: selectedDate, // Keep the selected date
                    state: data.location.state,
                    district: data.location.district,
                    readyBirdSmall: data.readyBird.small,
                    readyBirdMedium: data.readyBird.medium,
                    readyBirdBig: data.readyBird.big,
                    chickRate: data.chickRate,
                    feedCostIndex: data.feedCostIndex,
                });
            } else {
                // If no data exists for this date, reset some fields but keep date and location
                 form.reset({
                    date: selectedDate,
                    state: form.getValues('state'),
                    district: form.getValues('district'),
                    readyBirdSmall: 0,
                    readyBirdMedium: 0,
                    readyBirdBig: 0,
                    chickRate: 0,
                    feedCostIndex: 0,
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, selectedDate, form]);


    async function onSubmit(values: FormValues) {
        if (!firestore || !adminUser) {
            toast({ title: "Error", description: "You must be an admin to perform this action.", variant: "destructive" });
            return;
        }

        const dateString = format(values.date, 'yyyy-MM-dd');

        const dailyRateData: DailyRates = {
            id: dateString,
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

        const ratesDocRef = doc(firestore, 'dailyRates', dateString);
        
        try {
            await setDoc(ratesDocRef, dailyRateData, { merge: true });
            
            await addAuditLog(firestore, {
                adminUID: adminUser.uid,
                action: 'UPDATE_DAILY_RATES',
                details: `Updated daily rates for ${dateString} in ${values.district}, ${values.state}.`,
            });
            
            toast({
                title: "Rates Updated",
                description: `Daily rates for ${dateString} have been successfully updated.`,
            });
        } catch (error) {
            console.error("Error updating daily rates:", error);
            toast({ title: "Error", description: "Failed to update daily rates.", variant: "destructive" });
        }
    }
    
    return (
        <>
            <PageHeader title="Daily Rate Management" description="Update daily market rates for poultry products." />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Market Rates</CardTitle>
                            <CardDescription>
                                Select a date to view, edit, or add new rates. This will be visible to all premium users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Select Date to Edit</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : (
                                        <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State</FormLabel>
                                                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('district', ''); }} value={field.value}>
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
                                </div>
                                    
                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                                        {form.formState.isSubmitting ? "Updating..." : `Update Rates for ${format(selectedDate, 'dd MMM yyyy')}`}
                                    </Button>
                                    </>
                                    )}
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
