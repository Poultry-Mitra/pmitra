
// src/app/dealer/my-orders/create/page.tsx
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useMemo, useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { doc, onSnapshot } from "firebase/firestore";
import { PageHeader } from "../../_components/page-header";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    farmerUID: z.string().min(1, "Please select a farmer."),
    productId: z.string().min(1, "Please select a product."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateOrderPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user: dealerUser } = useUser();
    const [dealerInfo, setDealerInfo] = useState<User | null>(null);

    useEffect(() => {
        if(dealerUser && firestore) {
            const unsub = onSnapshot(doc(firestore, 'users', dealerUser.uid), (doc) => {
                if(doc.exists()) {
                    setDealerInfo(doc.data() as User);
                }
            });
            return () => unsub();
        }
    }, [dealerUser, firestore]);

    const farmerIds = useMemo(() => dealerInfo?.connectedFarmers || [], [dealerInfo]);
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
    const quantity = useWatch({ control: form.control, name: 'quantity' });
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const totalAmount = (selectedProduct?.ratePerUnit || 0) * (quantity || 0);

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
            router.push('/dealer/my-orders');
        } catch (error) {
            toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
        }
    }
    
    return (
        <>
        <PageHeader 
            title="Create New Order for Farmer"
            description="Select a farmer and product to create a new order. The farmer will need to approve it."
        />
        <div className="mt-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                <SelectItem key={product.id} value={product.id} disabled={product.quantity <= 0}>
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
                                        value={`₹${totalAmount.toLocaleString()}`}
                                        className="font-bold"
                                    />
                                </FormItem>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />}
                                    Create Order
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        </>
    );
}
