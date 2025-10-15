
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Save, Trash2, PlusCircle, IndianRupee, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth, useFirestore } from "@/firebase/provider";
import { addDealerInventoryItem } from "@/hooks/use-dealer-inventory";
import { addLedgerEntry } from "@/hooks/use-ledger";
import { cn } from "@/lib/utils";
import { useEffect, useCallback } from "react";
import Link from 'next/link';
import { useSuppliers } from "@/hooks/use-suppliers";
import { runTransaction } from "firebase/firestore";
import { useAppUser } from "@/app/app-provider";

const productSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  category: z.enum(["Feed", "Medicine", "Equipment", "Chicks", "Other"]),
  pricingBasis: z.enum(["TPR", "FOR", "Ex-Factory", "MRP"]),
  quantity: z.coerce.number().min(0, "Quantity must be non-negative."),
  unit: z.enum(["bag", "packet", "bottle", "pcs", "chick"]),
  mrpPerUnit: z.coerce.number().min(0, "MRP is required.").optional(),
  purchaseRatePerUnit: z.coerce.number().min(0, "Landing price is required."),
  ratePerUnit: z.coerce.number().min(0, "Sale rate is required."),
  discountType: z.enum(['percentage', 'amount']).default('amount'),
  discountValue: z.coerce.number().min(0).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  unitWeight: z.coerce.number().optional(),
  lowStockThreshold: z.coerce.number().min(0).default(10),
  tprIncentive: z.coerce.number().optional(),
});

const formSchema = z.object({
  // Supplier
  supplierId: z.string().min(1, "Please select a supplier."),
  
  // Products Array
  products: z.array(productSchema).min(1, "Please add at least one product."),

  // Costs
  transportCost: z.coerce.number().min(0).default(0),
  miscCost: z.coerce.number().min(0).default(0),
  
  // Payment
  paymentMethod: z.enum(['cash', 'credit', 'bank_transfer']),
  amountPaid: z.coerce.number().min(0).default(0),
  utrNumber: z.string().optional(),
  
  // Invoice
  invoiceDate: z.string().min(1, "Invoice date is required"),
  invoiceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SummaryCard({ control }: { control: any }) {
    const values = useWatch({ control });
    const products = values.products || [];
    const subTotal = products.reduce((acc: number, product: any) => acc + (parseFloat(product.purchaseRatePerUnit || '0') * parseFloat(product.quantity || '0')), 0);
    const totalDiscount = products.reduce((acc: number, product: any) => acc + parseFloat(product.discountAmount || '0'), 0);

    const transportCost = parseFloat(values.transportCost || '0');
    const miscCost = parseFloat(values.miscCost || '0');
    const amountPaid = parseFloat(values.amountPaid || '0');

    const netPayable = subTotal - totalDiscount + transportCost + miscCost;
    const balanceDue = netPayable - amountPaid;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items Subtotal</span>
                    <span className="font-medium">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Discount / Incentive</span>
                    <span className="font-medium text-destructive">- ₹{totalDiscount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transport Cost</span>
                    <span className="font-medium">+ ₹{transportCost.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Misc. Cost</span>
                    <span className="font-medium">+ ₹{miscCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Net Payable Amount</span>
                    <span>₹{netPayable.toFixed(2)}</span>
                </div>
                <Separator />
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium">- ₹{amountPaid.toFixed(2)}</span>
                </div>
                <div className={cn(
                    "flex justify-between font-bold text-lg rounded-md p-2",
                    balanceDue > 0 ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
                )}>
                    <span>Balance Due</span>
                    <span>₹{balanceDue.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}


export default function AddStockPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user } = useAppUser();
    const { suppliers, loading: suppliersLoading } = useSuppliers(user?.id);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            supplierId: "",
            products: [{ 
                productName: "", 
                category: "Feed", 
                unit: "bag", 
                mrpPerUnit: 0,
                purchaseRatePerUnit: 0, 
                ratePerUnit: 0, 
                discountType: "amount", 
                discountValue: 0,
                discountAmount: 0,
                quantity: 1, 
                unitWeight: 50, 
                lowStockThreshold: 10, 
                pricingBasis: 'TPR' 
            }],
            transportCost: 0,
            miscCost: 0,
            paymentMethod: "cash",
            amountPaid: 0,
            utrNumber: "",
            invoiceDate: new Date().toISOString().split('T')[0],
            invoiceNumber: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products"
    });

    const watchedProducts = useWatch({ control: form.control, name: 'products' });
    const paymentMethod = form.watch("paymentMethod");

    const isTransportDisabled = watchedProducts?.some(p => p.pricingBasis === 'FOR');

    useEffect(() => {
        if (isTransportDisabled) {
            form.setValue('transportCost', 0, { shouldValidate: true });
        }
    }, [isTransportDisabled, form]);

    const handleCategoryChange = (category: string, index: number) => {
        const unitDefaults: { [key: string]: "bag" | "packet" | "bottle" | "pcs" | "chick" } = {
            "Feed": "bag",
            "Chicks": "chick",
            "Equipment": "pcs",
            "Medicine": "bottle",
            "Other": "pcs",
        };
        const newUnit = unitDefaults[category] || "pcs";
        form.setValue(`products.${index}.unit`, newUnit);

        if (category === "Chicks") {
            form.setValue(`products.${index}.pricingBasis`, 'FOR');
        }
    };
    
    const recalculateDiscount = useCallback((index: number) => {
        const product = form.getValues(`products.${index}`);
        const { discountType, discountValue, purchaseRatePerUnit, quantity, pricingBasis, tprIncentive, mrpPerUnit } = product;
        
        let calculatedAmount = 0;
        
        if (pricingBasis === 'TPR') {
            calculatedAmount = (tprIncentive || 0) * (quantity || 0);
        } else {
            const basePriceForDiscount = pricingBasis === 'MRP' ? (mrpPerUnit || 0) : (purchaseRatePerUnit || 0);
            const totalBase = basePriceForDiscount * (quantity || 0);

            if (discountType === 'percentage') {
                calculatedAmount = totalBase * ((discountValue || 0) / 100);
            } else { // 'amount' per unit
                calculatedAmount = (discountValue || 0) * (quantity || 0);
            }
        }
        form.setValue(`products.${index}.discountAmount`, calculatedAmount, { shouldValidate: true });
    }, [form]);


    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name && type === 'change') {
                const parts = name.split('.');
                if (parts.length === 3 && [
                    'discountType', 'discountValue', 'purchaseRatePerUnit', 
                    'quantity', 'pricingBasis', 'tprIncentive', 'mrpPerUnit'
                ].includes(parts[2])) {
                    recalculateDiscount(parseInt(parts[1], 10));
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form, recalculateDiscount]);


    async function onSubmit(values: FormValues) {
        if (!firestore || !user || !auth) {
            toast({ title: "Error", description: "You must be logged in to add stock.", variant: "destructive" });
            return;
        }

        try {
             await runTransaction(firestore, async (transaction) => {
                const supplier = suppliers.find(s => s.id === values.supplierId);
                if (!supplier) throw new Error("Supplier not found");

                // 1. Add inventory items
                for (const product of values.products) {
                    addDealerInventoryItem(firestore, auth, user.id, {
                        supplierName: supplier.name,
                        productName: product.productName,
                        category: product.category,
                        quantity: product.quantity,
                        unit: product.unit,
                        ratePerUnit: product.ratePerUnit, // This is the sale rate
                        purchaseRatePerUnit: product.purchaseRatePerUnit,
                        unitWeight: ['pcs', 'chick'].includes(product.unit) ? undefined : product.unitWeight,
                        lowStockThreshold: product.lowStockThreshold,
                    });
                }
                
                // 2. Add a single debit entry to the ledger for the total purchase amount
                const netPayable = values.products.reduce((acc, p) => acc + (p.purchaseRatePerUnit * p.quantity) - p.discountAmount, 0) 
                                 + values.transportCost + values.miscCost;

                const ledgerDescription = `Purchase from ${supplier.name}` + (values.invoiceNumber ? ` (Bill: ${values.invoiceNumber})` : '');
                
                if (netPayable > 0) {
                     await addLedgerEntry(firestore, user.id, {
                        description: ledgerDescription,
                        amount: netPayable,
                        date: new Date(values.invoiceDate).toISOString(),
                    }, 'Debit');
                }

                // 3. Add a credit entry if payment was made
                if (values.amountPaid > 0) {
                     await addLedgerEntry(firestore, user.id, {
                        description: `Payment to ${supplier.name} via ${values.paymentMethod}`,
                        amount: values.amountPaid,
                        date: new Date(values.invoiceDate).toISOString(),
                    }, 'Credit');
                }
            });
            
            toast({
                title: "Stock Added",
                description: "The new purchase has been recorded and stock has been updated.",
            });
            router.push('/dealer/my-inventory');

        } catch (error: any) {
            console.error("Failed to add stock:", error);
            toast({
                title: "Error adding stock",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <PageHeader title="Add Stock / Inward Entry" description="Record a new purchase for your inventory from a supplier." />
            <div className="mt-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Supplier Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField name="supplierId" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Select Supplier</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={suppliersLoading} key={suppliers.length}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={suppliersLoading ? "Loading suppliers..." : "Select a supplier"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {suppliers.map(supplier => (
                                                            <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    If supplier not in list, <Link href="/dealer/suppliers/add" className="text-primary hover:underline">add new supplier here</Link>.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                                
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">Products</h3>
                                    {fields.map((field, index) => {
                                        const currentUnit = watchedProducts && watchedProducts[index]?.unit;
                                        const showUnitWeight = !['pcs', 'chick'].includes(currentUnit || "");
                                        const currentCategory = watchedProducts && watchedProducts[index]?.category;
                                        const pricingBasis = watchedProducts && watchedProducts[index]?.pricingBasis;

                                        return (
                                        <Card key={field.id} className="relative border-border">
                                             <CardHeader>
                                                 <CardTitle className="text-lg">Product #{index + 1}</CardTitle>
                                                 {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 h-8 w-8"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                 )}
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Section 1: Product Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                     <FormField control={form.control} name={`products.${index}.productName`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Product Name</FormLabel>
                                                            <FormControl><Input placeholder="e.g., Broiler Starter Feed" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                     )} />
                                                      <FormField control={form.control} name={`products.${index}.category`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Category</FormLabel>
                                                            <Select onValueChange={(value) => { field.onChange(value); handleCategoryChange(value, index); }} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Feed">Feed</SelectItem>
                                                                    <SelectItem value="Medicine">Medicine</SelectItem>
                                                                    <SelectItem value="Equipment">Equipment</SelectItem>
                                                                    <SelectItem value="Chicks">Chicks</SelectItem>
                                                                    <SelectItem value="Other">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                             <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                
                                                <Separator />

                                                {/* Section 2: Pricing & Discount */}
                                                <div>
                                                    <h4 className="text-sm font-medium mb-4">Pricing & Discount</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <FormField control={form.control} name={`products.${index}.mrpPerUnit`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>MRP/Unit (₹)</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name={`products.${index}.purchaseRatePerUnit`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Landing Price/Unit (₹)</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name={`products.${index}.ratePerUnit`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Sale Rate/Unit (₹)</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6">
                                                        <FormField control={form.control} name={`products.${index}.pricingBasis`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Pricing Basis</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value} disabled={currentCategory === 'Chicks'}>
                                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="TPR">TPR</SelectItem>
                                                                        <SelectItem value="FOR">FOR (Free on Road)</SelectItem>
                                                                        <SelectItem value="Ex-Factory">Ex-Factory</SelectItem>
                                                                        <SelectItem value="MRP">MRP</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        
                                                        {pricingBasis === 'TPR' ? (
                                                            <FormField control={form.control} name={`products.${index}.tprIncentive`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>TPR Incentive (₹ per Unit)</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input type="number" className="pl-8" placeholder="e.g., 50" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                        ) : (
                                                            <FormField control={form.control} name={`products.${index}.discountValue`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Discount</FormLabel>
                                                                    <div className="flex">
                                                                        <Input
                                                                            type="number"
                                                                            className="rounded-r-none focus:z-10"
                                                                            placeholder={watchedProducts?.[index]?.discountType === 'percentage' ? "e.g., 5" : "e.g., 100"}
                                                                            {...field}
                                                                        />
                                                                        <FormField control={form.control} name={`products.${index}.discountType`} render={({ field: typeField }) => (
                                                                            <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-[80px] rounded-l-none border-l-0">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="percentage">%</SelectItem>
                                                                                    <SelectItem value="amount">₹</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                        )}

                                                        <FormField control={form.control} name={`products.${index}.discountAmount`} render={({ field }) => (
                                                            <FormItem className="hidden">
                                                                <FormControl><Input type="number" readOnly {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                </div>
                                                
                                                <Separator/>

                                                {/* Section 3: Stock & Quantity */}
                                                 <div>
                                                    <h4 className="text-sm font-medium mb-4">Stock & Quantity</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <FormField control={form.control} name={`products.${index}.quantity`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name={`products.${index}.unit`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="bag">Bag</SelectItem>
                                                                        <SelectItem value="packet">Packet</SelectItem>
                                                                        <SelectItem value="bottle">Bottle</SelectItem>
                                                                        <SelectItem value="pcs">Pieces</SelectItem>
                                                                        <SelectItem value="chick">Chick</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        {showUnitWeight && <FormField control={form.control} name={`products.${index}.unitWeight`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit Wt. (kg)</FormLabel>
                                                                <FormControl><Input type="number" placeholder="Optional" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />}
                                                        <FormField control={form.control} name={`products.${index}.lowStockThreshold`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Low Stock At</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    )})}
                                </div>

                                <Button type="button" variant="outline" onClick={() => append({ productName: "", category: "Feed", unit: "bag", purchaseRatePerUnit: 0, ratePerUnit: 0, discountType: "amount", discountValue: 0, discountAmount: 0, quantity: 1, unitWeight: 50, lowStockThreshold: 10, pricingBasis: 'TPR' })}>
                                    <PlusCircle className="mr-2" />
                                    Add Another Product
                                </Button>
                            </div>

                            <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24">
                                <SummaryCard control={form.control} />
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Invoice & Payment</CardTitle>
                                    </CardHeader>
                                     <CardContent className="space-y-6">
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
                                                <FormControl><Input placeholder="e.g., INV-2024-001" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        
                                        <Separator/>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField name="transportCost" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transport Cost</FormLabel>
                                                    <FormControl><Input type="number" {...field} disabled={isTransportDisabled} /></FormControl>
                                                    {isTransportDisabled && <FormDescription className="text-xs">Disabled for FOR pricing.</FormDescription>}
                                                </FormItem>
                                            )} />
                                            <FormField name="miscCost" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Other Costs</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                         <FormField name="paymentMethod" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Method</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="credit">Credit</SelectItem>
                                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                         <FormField name="amountPaid" control={form.control} render={({ field }) => (
                                             <FormItem>
                                                <FormLabel>Amount Paid</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input type="number" className="pl-8" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                         )} />
                                         {paymentMethod === 'bank_transfer' && (
                                            <FormField name="utrNumber" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>UTR / Transaction ID</FormLabel>
                                                    <FormControl><Input placeholder="Enter bank transaction reference" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        )}
                                     </CardContent>
                                </Card>
                                 <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                                    {form.formState.isSubmitting ? "Saving..." : "Record Purchase"}
                                 </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
