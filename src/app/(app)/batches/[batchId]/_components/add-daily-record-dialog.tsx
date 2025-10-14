
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addDailyRecord } from '@/hooks/use-batches';
import { useFirestore } from '@/firebase/provider';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryByCategory } from '@/hooks/use-inventory';
import { useAppUser } from '@/app/app-provider';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
    date: z.date(),
    mortality: z.coerce.number().int().min(0, "Mortality must be non-negative."),
    feedItemId: z.string().optional(),
    feedConsumed: z.coerce.number().min(0, "Feed consumption must be non-negative."),
    avgBodyWeight: z.coerce.number().min(0, "Weight must be non-negative."),
    medicationGiven: z.string().optional(),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddDailyRecordDialog({ open, onOpenChange, batchId }: { open: boolean; onOpenChange: (open: boolean) => void, batchId: string }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useAppUser();
    const { inventory: feedItems, loading: feedLoading } = useInventoryByCategory(user?.id || '', "Feed");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            mortality: 0,
            feedConsumed: 0,
            avgBodyWeight: 0,
            medicationGiven: "",
            notes: "",
        },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore || !batchId || !user) {
            toast({ title: "Error", description: "Could not add daily record.", variant: "destructive" });
            return;
        }

        try {
            await addDailyRecord(firestore, user.id, batchId, values);
            toast({
                title: "Daily Record Added",
                description: `Record for ${format(values.date, "PPP")} has been successfully added.`,
            });
            onOpenChange(false);
            form.reset({ date: new Date(), mortality: 0, feedConsumed: 0, avgBodyWeight: 0, feedItemId: "", medicationGiven: "", notes: "" });
        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Failed to add daily record.", variant: "destructive" });
             console.error("Failed to add daily record", error);
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Daily Record</DialogTitle>
                    <DialogDescription>Enter daily statistics. Feed consumption will automatically update your inventory.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
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
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="mortality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Today's Mortality</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="avgBodyWeight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avg. Body Weight (g)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="feedItemId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Feed Used</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={feedLoading}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={feedLoading ? "Loading feeds..." : "Select feed from inventory"} />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {feedItems.map(item => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.productName} ({item.stockQuantity.toFixed(2)} {item.unit})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="feedConsumed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Feed Consumed (kg)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="medicationGiven"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medication / Vaccine Given (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Lasota vaccine, B-complex vitamins" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes / Observations (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Litter is damp, birds seem lethargic, ammonia smell is high" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : "Save Record"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
