

"use client";

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addBatch, type Batch } from '@/hooks/use-batches';
import { useFirestore, useUser } from '@/firebase/provider';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const formSchema = z.object({
    batchName: z.string().min(3, "Batch name must be at least 3 characters."),
    batchType: z.enum(["Broiler", "Layer"]),
    breed: z.string().optional(),
    totalChicks: z.coerce.number().int().min(1, "Total chicks must be at least 1."),
    batchStartDate: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddBatchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const user = useUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            batchName: "",
            batchType: "Broiler",
            breed: "Cobb",
            totalChicks: 500,
            batchStartDate: new Date(),
        },
    });

    const batchType = useWatch({ control: form.control, name: 'batchType' });

    async function onSubmit(values: FormValues) {
        if (!firestore || !user) {
            toast({ title: "Error", description: "You must be logged in to add a batch.", variant: "destructive" });
            return;
        }

        const newBatch: Omit<Batch, 'id' | 'createdAt' | 'farmerUID'> = {
            ...values,
            batchStartDate: values.batchStartDate.toISOString(),
            feedPhase: "Pre-Starter",
            mortalityCount: 0,
            avgBodyWeight: 40, // Starting weight for a chick
            feedConsumed: 0,
            status: "Active",
            breed: values.batchType === 'Broiler' ? values.breed : undefined,
        };

        try {
            addBatch(firestore, user.uid, newBatch);
            toast({
                title: "Batch Added",
                description: `${newBatch.batchName} has been successfully created.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
             toast({ title: "Error", description: "Failed to add batch.", variant: "destructive" });
             console.error("Failed to add batch", error)
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Batch</DialogTitle>
                    <DialogDescription>Fill in the details for your new poultry batch.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="batchName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Winter Broiler Batch" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="batchType"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Batch Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select batch type" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Broiler">Broiler</SelectItem>
                                            <SelectItem value="Layer">Layer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {batchType === 'Broiler' && (
                                <FormField
                                    control={form.control}
                                    name="breed"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Breed</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select broiler breed" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Cobb">Cobb</SelectItem>
                                                <SelectItem value="Ross">Ross</SelectItem>
                                                <SelectItem value="Hubbard">Hubbard</SelectItem>
                                                <SelectItem value="Arbor Acres">Arbor Acres</SelectItem>
                                                <SelectItem value="Marshall">Marshall</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="totalChicks"
                                render={({ field }) => (
                                    <FormItem className={cn(batchType !== 'Broiler' && 'col-span-2 md:col-span-1')}>
                                        <FormLabel>Total Chicks</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="batchStartDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Batch Start Date</FormLabel>
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Create Batch</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
