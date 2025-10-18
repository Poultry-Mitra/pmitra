// src/app/dealer/my-inventory/_components/edit-stock-dialog.tsx
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
import { useFirestore, useAuth } from '@/firebase/provider';
import { updateDealerInventoryItem, type DealerInventoryItem } from '@/hooks/use-dealer-inventory';
import { IndianRupee, Save, Loader2 } from 'lucide-react';

const formSchema = z.object({
    quantity: z.coerce.number().min(0, "Stock quantity must be non-negative."),
    ratePerUnit: z.coerce.number().min(0, "Rate must be non-negative."),
    lowStockThreshold: z.coerce.number().min(0, "Threshold must be non-negative."),
});

type FormValues = z.infer<typeof formSchema>;

export function EditStockDialog({ open, onOpenChange, item }: { open: boolean; onOpenChange: (open: boolean) => void, item: DealerInventoryItem }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: item.quantity,
            ratePerUnit: item.ratePerUnit,
            lowStockThreshold: item.lowStockThreshold || 10,
        },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore || !auth) {
            toast({ title: "Error", description: "Could not update stock.", variant: "destructive" });
            return;
        }

        try {
            await updateDealerInventoryItem(firestore, auth, item.id, values);
            toast({
                title: "Stock Updated",
                description: `Stock for ${item.productName} has been updated.`,
            });
            onOpenChange(false);
        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Failed to update stock.", variant: "destructive" });
             console.error("Failed to update stock", error);
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Stock: {item.productName}</DialogTitle>
                    <DialogDescription>Update the quantity, rate, and low stock alert threshold for this item.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                         <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock Quantity ({item.unit})</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="ratePerUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rate per Unit</FormLabel>
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
                            name="lowStockThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Low Stock Alert Threshold</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
