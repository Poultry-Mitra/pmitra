
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
import { useFirestore, useAuth } from "@/firebase/provider";
import { useUsersByIds } from "@/hooks/use-users";
import { useDealerInventory } from "@/hooks/use-dealer-inventory";
import { createOrder } from "@/hooks/use-orders";
import { Send, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "../../_components/page-header";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/language-provider";
import { useAppUser } from "@/app/app-provider";

const formSchema = z.object({
    saleType: z.enum(["online", "offline"]),
    farmerUID: z.string().optional(),
    offlineCustomerName: z.string().optional(),
    offlineCustomerContact: z.string().optional(),
    productId: z.string().min(1, "Please select a product."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
}).refine(data => {
    if (data.saleType === 'online' && !data.farmerUID) return false;
    return true;
}, {
    message: "Please select a connected farmer for an online sale.",
    path: ["farmerUID"],
}).refine(data => {
    if (data.saleType === 'offline' && !data.offlineCustomerName) return false;
    return true;
}, {
    message: "Customer name is required for an offline sale.",
    path: ["offlineCustomerName"],
});


type FormValues = z.infer<typeof formSchema>;

export default function CreateOrderPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user: dealerUser } = useAppUser();
    const { t } = useLanguage();

    const farmerIds = useMemo(() => dealerUser?.connectedFarmers || [], [dealerUser]);
    const { users: farmers, loading: farmersLoading } = useUsersByIds(farmerIds);
    const { inventory: products, loading: productsLoading } = useDealerInventory(dealerUser?.id || '');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            saleType: "online",
            quantity: 1,
        },
    });

    const saleType = useWatch({ control: form.control, name: 'saleType' });
    const selectedProductId = useWatch({ control: form.control, name: 'productId' });
    const quantity = useWatch({ control: form.control, name: 'quantity' });
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const totalAmount = (selectedProduct?.ratePerUnit || 0) * (quantity || 0);

    async function onSubmit(values: FormValues) {
        if (!dealerUser || !selectedProduct || !firestore) {
            toast({ title: t('messages.error'), description: "Could not create order.", variant: "destructive" });
            return;
        }

        const isOfflineSale = values.saleType === 'offline';

        try {
            await createOrder(firestore, {
                dealerUID: dealerUser.id,
                isOfflineSale,
                farmerUID: isOfflineSale ? undefined : values.farmerUID,
                offlineCustomerName: isOfflineSale ? values.offlineCustomerName : undefined,
                offlineCustomerContact: isOfflineSale ? values.offlineCustomerContact : undefined,
                productId: values.productId,
                productName: selectedProduct.productName,
                quantity: values.quantity,
                ratePerUnit: selectedProduct.ratePerUnit,
                totalAmount: totalAmount,
                status: isOfflineSale ? 'Completed' : 'Pending',
            });

            toast({
                title: `Order ${isOfflineSale ? 'Recorded' : 'Sent'}`,
                description: isOfflineSale 
                    ? `The offline sale to ${values.offlineCustomerName} has been recorded.`
                    : `An order has been sent to the selected farmer for approval.`,
            });
            router.push('/dealer/my-orders');
        } catch (error: any) {
            toast({ title: t('messages.error'), description: error.message || "Failed to create order.", variant: "destructive" });
        }
    }
    
    return (
        <>
        <PageHeader 
            title={t('dealer.create_order')}
            description="Create an order for a connected farmer or record an offline sale."
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
                                name="saleType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Order Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                            >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="online" /></FormControl>
                                                <FormLabel className="font-normal">Online (for a connected farmer)</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="offline" /></FormControl>
                                                <FormLabel className="font-normal">Offline (for a walk-in customer)</FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            {saleType === 'online' ? (
                                <FormField
                                    control={form.control}
                                    name="farmerUID"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Connected Farmer</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={farmersLoading}>
                                                <FormControl><SelectTrigger><SelectValue placeholder={farmersLoading ? "Loading..." : "Select a farmer"} /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {farmers.map(farmer => <SelectItem key={farmer.id} value={farmer.id}>{farmer.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="offlineCustomerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Customer Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., Ramesh Kumar" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="offlineCustomerContact"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Customer Contact (Optional)</FormLabel>
                                                <FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                             <FormField
                                control={form.control}
                                name="productId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={productsLoading}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={productsLoading ? "Loading products..." : "Select from inventory"} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {products.map(p => <SelectItem key={p.id} value={p.id} disabled={p.quantity <= 0}>{p.productName} (Stock: {p.quantity})</SelectItem>)}
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
                                <Button type="button" variant="outline" onClick={() => router.back()}>{t('actions.cancel')}</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />}
                                    {saleType === 'online' ? 'Send Order for Approval' : 'Record Offline Sale'}
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
