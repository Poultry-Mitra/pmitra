
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
import { useFirestore } from "@/firebase/provider";
import { useDealerInventory } from "@/hooks/use-dealer-inventory";
import { createOrder } from "@/hooks/use-orders";
import { Save, Loader2 } from "lucide-react";
import { PageHeader } from "../../_components/page-header";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAppUser } from "@/app/app-provider";

const formSchema = z.object({
    offlineCustomerName: z.string().min(1, "Customer name is required."),
    offlineCustomerContact: z.string().optional(),
    productId: z.string().min(1, "Please select a product."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});


type FormValues = z.infer<typeof formSchema>;

export default function CreateOfflineSalePage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user: dealerUser } = useAppUser();
    const { t } = useLanguage();

    const { inventory: products, loading: productsLoading } = useDealerInventory(dealerUser?.id || '');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 1,
        },
    });

    const selectedProductId = useWatch({ control: form.control, name: 'productId' });
    const quantity = useWatch({ control: form.control, name: 'quantity' });
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const totalAmount = (selectedProduct?.ratePerUnit || 0) * (quantity || 0);

    async function onSubmit(values: FormValues) {
        if (!dealerUser || !selectedProduct || !firestore) {
            toast({ title: t('messages.error'), description: "Could not create order.", variant: "destructive" });
            return;
        }

        try {
            await createOrder(firestore, {
                dealerUID: dealerUser.id,
                isOfflineSale: true,
                offlineCustomerName: values.offlineCustomerName,
                offlineCustomerContact: values.offlineCustomerContact,
                productId: values.productId,
                productName: selectedProduct.productName,
                quantity: values.quantity,
                ratePerUnit: selectedProduct.ratePerUnit,
                totalAmount: totalAmount,
                status: 'Completed', // Offline sales are completed immediately
            });

            toast({
                title: "Offline Sale Recorded",
                description: `The sale to ${values.offlineCustomerName} has been recorded.`,
            });
            router.push('/dealer/my-orders');
        } catch (error: any) {
            toast({ title: t('messages.error'), description: error.message || "Failed to create order.", variant: "destructive" });
        }
    }
    
    return (
        <>
        <PageHeader 
            title="Record Offline Sale"
            description="Use this form to record a sale made to a walk-in or offline customer."
        />
        <div className="mt-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                                    Record Sale
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
