// src/app/(app)/dealers/[dealerId]/products/_components/create-order-dialog.tsx
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useUser, useFirestore } from "@/firebase/provider";
import { createOrder } from "@/hooks/use-orders";
import { Send, Loader2 } from "lucide-react";
import type { User, DealerInventoryItem } from "@/lib/types";

const formSchema = z.object({
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DealerInventoryItem;
  dealer: User;
}

export function CreateOrderDialog({ open, onOpenChange, product, dealer }: CreateOrderDialogProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const farmerUser = useUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 1,
        },
    });

    const quantity = useWatch({ control: form.control, name: 'quantity' });
    const totalAmount = (product.ratePerUnit * quantity).toLocaleString();

    async function onSubmit(values: FormValues) {
        if (!farmerUser || !firestore) {
            toast({ title: "Error", description: "You must be logged in to create an order.", variant: "destructive" });
            return;
        }

        if (values.quantity > product.quantity) {
            form.setError("quantity", { type: "manual", message: "Quantity cannot exceed available stock." });
            return;
        }

        try {
            await createOrder(firestore, {
                farmerUID: farmerUser.uid,
                dealerUID: dealer.id,
                productId: product.id,
                productName: product.productName,
                quantity: values.quantity,
                ratePerUnit: product.ratePerUnit,
                totalAmount: product.ratePerUnit * values.quantity,
                status: 'Pending',
            });
            toast({
                title: "Order Sent!",
                description: `Your order for ${product.productName} has been sent to ${dealer.name} for approval.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Order creation failed:", error);
            toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Order: {product.productName}</DialogTitle>
                    <DialogDescription>
                        Ordering from {dealer.name}. Available stock: {product.quantity} {product.unit}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity ({product.unit})</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormItem>
                                <FormLabel>Total Amount</FormLabel>
                                <Input 
                                    readOnly 
                                    value={`₹${totalAmount}`}
                                    className="font-bold"
                                />
                            </FormItem>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />}
                                Send Order
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
