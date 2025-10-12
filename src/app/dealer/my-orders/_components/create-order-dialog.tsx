
// src/app/dealer/my-orders/_components/create-order-dialog.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase/provider";
import { useUsersByIds } from "@/hooks/use-users";
import { useDealerInventory } from "@/hooks/use-dealer-inventory";
import { createOrder } from "@/hooks/use-orders";
import { Send, Loader2 } from "lucide-react";
import { useMemo } from "react";
import type { User } from "@/lib/types";

const formSchema = z.object({
    farmerUID: z.string().min(1, "Please select a farmer."),
    productId: z.string().min(1, "Please select a product."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const dealerUser = useUser() as User; // Assuming user is a dealer and logged in

    const farmerIds = useMemo(() => dealerUser?.connectedFarmers || [], [dealerUser]);
    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);
    const { inventory: products, loading: productsLoading } = useDealerInventory(dealerUser?.uid || '');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            farmerUID: "",
            productId: "",
            quantity: 1,
        },
    });

    const selectedProductId = useWatch({ control: form.control, name: 'productId' });
    const selectedProduct = products.find(p => p.id === selectedProductId);

    async function onSubmit(values: FormValues) {
        if (!dealerUser || !selectedProduct || !firestore) {
            toast({ title: "Error", description: "Could not create order.", variant: "destructive" });
            return;
        }
        
        const selectedFarmer = farmers.find(f => f.id === values.farmerUID);
        if (!selectedFarmer) {
            toast({ title: "Error", description: "Selected farmer not found.", variant: "destructive" });
            return;
        }

        try {
            await createOrder(firestore, {
                farmerUID: values.farmerUID,
                dealerUID: dealerUser.uid,
                productId: values.productId,
                productName: selectedProduct.productName,
                quantity: values.quantity,
                ratePerUnit: selectedProduct.ratePerUnit,
                totalAmount: selectedProduct.ratePerUnit * values.quantity,
                status: 'Pending', // Order is pending until farmer approves
            });
            toast({
                title: "Order Created",
                description: `An order for ${selectedFarmer.name} has been created and is pending their approval.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Order for Farmer</DialogTitle>
                    <DialogDescription>Select a farmer and product to create a new order. The farmer will need to approve it.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="farmerUID"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Select Farmer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={farmersLoading}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={farmersLoading ? "Loading farmers..." : "Select a connected farmer"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {farmers.map(farmer => (
                                            <SelectItem key={farmer.id} value={farmer.id}>{farmer.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Select Product</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={productsLoading}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={productsLoading ? "Loading products..." : "Select from your inventory"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.productName} (Stock: {product.quantity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormItem>
                                <FormLabel>Total Amount</FormLabel>
                                <Input 
                                    readOnly 
                                    value={`₹${((selectedProduct?.ratePerUnit || 0) * form.watch('quantity')).toLocaleString()}`}
                                />
                            </FormItem>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />}
                                Create Order
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
