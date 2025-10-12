
"use client";

import { useState, useEffect } from 'react';
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
import { IndianRupee } from "lucide-react";
import { mockDailyRates } from "@/lib/data";

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

export default function DailyRateManagementPage() {
    const { toast } = useToast();
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date(mockDailyRates.lastUpdated).toLocaleString());
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            state: mockDailyRates.location.state,
            district: mockDailyRates.location.district,
            readyBirdSmall: mockDailyRates.readyBird.small,
            readyBirdMedium: mockDailyRates.readyBird.medium,
            readyBirdBig: mockDailyRates.readyBird.big,
            chickRate: mockDailyRates.chickRate,
            feedCostIndex: mockDailyRates.feedCostIndex,
        },
    });

    function onSubmit(values: FormValues) {
        console.log(values);
        // In a real app, you would call an API to update these rates in the database
        toast({
            title: "Rates Updated",
            description: "Daily rates have been successfully updated.",
        });
        setLastUpdated(new Date().toLocaleString());
    }

    return (
        <>
            <PageHeader title="Daily Rate Management" description="Update daily market rates for poultry products." />
            <div className="mt-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Update Market Rates</CardTitle>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a state" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                                                        <SelectItem value="Gujarat">Gujarat</SelectItem>
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
                                                <Input placeholder="e.g., Pune" {...field} />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Ready Bird Rate (₹/kg)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                         <FormField
                                            control={form.control}
                                            name="readyBirdSmall"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Small</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="110" {...field} />
                                                    </FormControl>
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
                                                    <FormControl>
                                                        <Input type="number" placeholder="125" {...field} />
                                                    </FormControl>
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
                                                    <FormControl>
                                                        <Input type="number" placeholder="140" {...field} />
                                                    </FormControl>
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
                                                <FormControl>
                                                    <Input type="number" placeholder="35" {...field} />
                                                </FormControl>
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
                                                <FormControl>
                                                    <Input type="number" placeholder="45.5" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                               </div>
                                
                                <Button type="submit" className="w-full">
                                    <IndianRupee className="mr-2" />
                                    Update Rates
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
