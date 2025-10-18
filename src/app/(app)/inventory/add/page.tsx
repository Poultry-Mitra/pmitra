
// src/app/(app)/inventory/add/page.tsx
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Save, Trash2, PlusCircle, IndianRupee, Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { addInventoryItem } from "@/hooks/use-inventory";
import { addLedgerEntryInTransaction } from "@/hooks/use-ledger";
import { runTransaction } from "firebase/firestore";
import { useAppUser } from "@/app/app-provider";

const productSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  category: z.enum(["Feed", "Medicine", "Chicks", "Bedding", "Sanitizers", "Other"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unit: z.enum(["kg", "grams", "liters", "ml", "units"]),
  purchaseRate: z.coerce.number().min(0, "Purchase rate is required."),
  lowStockThreshold: z.coerce.number().min(0).default(10),
});

const formSchema = z.object({
  supplierName: z.string().min(2, "Supplier/Shop name is required."),
  products: z.array(productSchema).min(1, "Please add at least one product."),
  amountPaid: z.coerce.number().min(0).default(0),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  invoiceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FarmerAddPurchasePage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useAppUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            supplierName: "",
            products: [{ productName: "", category: "Feed", quantity: 1, unit: "kg", purchaseRate: 0, lowStockThreshold: 10 }],
            amountPaid: 0,
            invoiceDate: new Date().toISOString().split('T')[0],
            invoiceNumber: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products"
    });

    const watchedProducts = useWatch({ control: form.control, name: 'products' });
    const totalPurchaseValue = watchedProducts.reduce((acc, product) => {
        return acc + (product.quantity || 0) * (product.purchaseRate || 0);
    }, 0);

    async function onSubmit(values: FormValues) {
        if (!firestore || !user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        try {
            await runTransaction(firestore, async (transaction) => {
                // 1. Add inventory items
                for (const product of values.products) {
                    await addInventoryItem(firestore, user.id, {
                        productName: product.productName,
                        category: product.category,
                        stockQuantity: product.quantity,
                        unit: product.unit,
                        lowStockThreshold: product.lowStockThreshold,
                    });
                }
                
                // 2. Add a single debit entry to the ledger
                const ledgerDescription = `Purchase from ${values.supplierName}` + (values.invoiceNumber ? ` (Bill: ${values.invoiceNumber})` : '');

                await addLedgerEntryInTransaction(transaction, firestore, user.id, {
                    description: ledgerDescription,
                    amount: totalPurchaseValue,
                    date: new Date(values.invoiceDate).toISOString(),
                }, 'Debit');
                
                // 3. Add a credit entry if payment was made
                if (values.amountPaid > 0) {
                     await addLedgerEntryInTransaction(transaction, firestore, user.id, {
                        description: `Payment to ${values.supplierName}`,
                        amount: values.amountPaid,
                        date: new Date(values.invoiceDate).toISOString(),
                    }, 'Credit');
                }
            });

            toast({
                title: "Purchase Recorded",
                description: "Your inventory and ledger have been updated.",
            });
            router.push('/inventory');
        } catch (error: any) {
             toast({
                title: "Error Recording Purchase",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <PageHeader title="Add Purchase" description="Record items bought from a supplier or local shop." />
            <div className="mt-8 max-w-4xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier & Bill Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField name="supplierName" control={form.control} render={({ field }) => (
                                    <FormItem className="md:col-span-1">
                                        <FormLabel>Supplier / Shop Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Local Agri Store" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="invoiceDate" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice/Bill Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField name="invoiceNumber" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice/Bill No. (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., INV-123" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                        
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <Card key={field.id}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Product #{index + 1}</CardTitle>
                                        {fields.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name={`products.${index}.productName`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., Broiler Starter Pellets" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <FormField control={form.control} name={`products.${index}.category`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Feed">Feed</SelectItem>
                                                            <SelectItem value="Medicine">Medicine</SelectItem>
                                                            <SelectItem value="Chicks">Chicks</SelectItem>
                                                            <SelectItem value="Bedding">Bedding</SelectItem>
                                                            <SelectItem value="Sanitizers">Sanitizers</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`products.${index}.quantity`} render={({ field }) => (
                                                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`products.${index}.unit`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="kg">kg</SelectItem>
                                                            <SelectItem value="grams">grams</SelectItem>
                                                            <SelectItem value="liters">liters</SelectItem>
                                                            <SelectItem value="ml">ml</SelectItem>
                                                            <SelectItem value="units">units</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`products.${index}.purchaseRate`} render={({ field }) => (
                                                <FormItem><FormLabel>Rate/Unit (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                             <Button type="button" variant="outline" onClick={() => append({ productName: "", category: "Feed", quantity: 1, unit: "kg", purchaseRate: 0, lowStockThreshold: 10 })}>
                                <PlusCircle className="mr-2" /> Add Another Product
                            </Button>
                        </div>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-secondary p-4 text-right">
                                    <p className="text-sm text-muted-foreground">Total Purchase Value</p>
                                    <p className="text-2xl font-bold">₹{totalPurchaseValue.toLocaleString()}</p>
                                </div>
                                 <FormField name="amountPaid" control={form.control} render={({ field }) => (
                                     <FormItem>
                                        <FormLabel>Amount Paid Now</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" className="pl-8" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                     </FormItem>
                                 )} />
                                <div className="rounded-lg border bg-destructive/10 p-4 text-right text-destructive">
                                    <p className="text-sm">Balance Due</p>
                                    <p className="text-2xl font-bold">₹{(totalPurchaseValue - form.getValues('amountPaid')).toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                                Record Purchase
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}
