

"use client";

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
import { completeBatch, type Batch } from '@/hooks/use-batches';
import { useFirestore, useAuth, AuthContext } from '@/firebase/provider';
import { Calendar as CalendarIcon, IndianRupee, Scale, User, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useContext, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

const formSchema = z.object({
    totalWeightSold: z.coerce.number().min(0.1, "Total weight must be positive."),
    pricePerKg: z.coerce.number().min(1, "Price per kg must be at least 1."),
    buyerName: z.string().min(2, "Buyer name is required."),
    saleDate: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function CompleteBatchDialog({ open, onOpenChange, batch }: { open: boolean; onOpenChange: (open: boolean) => void, batch: Batch }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user } = useContext(AuthContext)!;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalWeightSold: 0,
            pricePerKg: 0,
            buyerName: "",
            saleDate: new Date(),
        },
    });
    
    const watchedValues = useWatch({ control: form.control });
    const totalSaleAmount = useMemo(() => {
        return (watchedValues.totalWeightSold || 0) * (watchedValues.pricePerKg || 0);
    }, [watchedValues]);

    async function onSubmit(values: FormValues) {
        if (!firestore || !user || !auth) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        try {
            await completeBatch(firestore, auth, user.uid, batch.id, values);
            toast({
                title: "Batch Completed!",
                description: `Sale from batch ${batch.batchName} has been recorded and your ledger updated.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Failed to complete batch.", variant: "destructive" });
             console.error("Failed to complete batch", error);
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Batch: {batch.batchName}</DialogTitle>
                    <DialogDescription>Record final sale details. This will mark the batch as 'Completed' and add the income to your ledger.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="totalWeightSold" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Weight Sold (kg)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.1" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="pricePerKg" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sale Price (per kg)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.1" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField name="buyerName" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Buyer Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="e.g., Local Market Wholesaler" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField name="saleDate" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date of Sale</FormLabel>
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
                        )} />

                        <div className="rounded-lg border bg-green-500/10 p-4 text-right text-green-700 dark:text-green-400">
                            <p className="text-sm">Total Sale Amount</p>
                            <p className="text-2xl font-bold">₹{totalSaleAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : "Confirm & Complete Batch"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
