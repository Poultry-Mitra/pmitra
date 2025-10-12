
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addLedgerEntry, type LedgerEntry } from '@/hooks/use-ledger';
import { useFirestore } from '@/firebase/provider';
import { currentUser } from '@/lib/data';
import { Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
    category: z.enum(["Transport", "Labour", "Electricity", "Misc"]),
    description: z.string().min(3, "Description is required."),
    amount: z.coerce.number().min(1, "Amount must be greater than 0."),
    date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddExpenseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const user = currentUser;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            amount: 0,
            category: "Misc",
            date: new Date(),
        },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore || !user) {
            toast({ title: "Error", description: "Could not add expense.", variant: "destructive" });
            return;
        }

        const newEntry: Omit<LedgerEntry, 'id' | 'farmerUID' | 'type' | 'balanceAfter'> = {
            description: `${values.category}: ${values.description}`,
            amount: values.amount,
            date: values.date.toISOString(),
        };

        try {
            await addLedgerEntry(firestore, user.id, newEntry, 'Debit');
            toast({
                title: "Expense Added",
                description: `${values.description} has been added to your ledger.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
             toast({ title: "Error", description: "Failed to add expense.", variant: "destructive" });
             console.error("Failed to add expense", error)
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Manual Expense</DialogTitle>
                    <DialogDescription>Record expenses like transport, labour, or other miscellaneous costs.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an expense category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Labour">Labour</SelectItem>
                                        <SelectItem value="Electricity">Electricity</SelectItem>
                                        <SelectItem value="Misc">Miscellaneous</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea placeholder="e.g., Paid for electricity bill" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date of Expense</FormLabel>
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
                            <Button type="submit">Add Expense</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
