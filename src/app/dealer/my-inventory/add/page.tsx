
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Save, Trash2, PlusCircle, IndianRupee, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useFirestore, useUser } from "@/firebase/provider";
import { addDealerInventoryItem, type DealerInventoryItem } from "@/hooks/use-dealer-inventory";
import { addLedgerEntry } from "@/hooks/use-ledger";

const productSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  category: z.enum(["Feed", "Medicine", "Equipment", "Chicks", "Other"]),
  quantity: z.coerce.number().min(0, "Quantity must be non-negative."),
  unit: z.enum(["bag", "packet", "bottle", "pcs", "chick"]),
  ratePerUnit: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  unitWeight: z.coerce.number().optional(),
  lowStockThreshold: z.coerce.number().min(0).default(10),
});

const formSchema = z.object({
  // Supplier
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  
  // Products Array
  products: z.array(productSchema).min(1, "Please add at least one product."),

  // Costs
  transportCost: z.coerce.number().min(0).default(0),
  miscCost: z.coerce.number().min(0).default(0),
  
  // Payment
  paymentMethod: z.enum(['cash', 'credit', 'bank_transfer']),
  amountPaid: z.coerce.number().min(0),
  utrNumber: z.string().optional(),
  
  // Invoice
  invoiceDate: z.string().min(1, "Invoice date is required"),
  invoiceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SummaryCard({ control }: { control: any }) {
    const values = useWatch({ control });
    const products = values.products || [];
    const subTotal = products.reduce((acc: number, product: any) => acc + (product.ratePerUnit * product.quantity), 0);
    const totalDiscount = products.reduce((acc: number, product: any) => acc + product.discount, 0);
    const transportCost = values.transportCost || 0;
    const miscCost = values.miscCost || 0;
    const netPayable = subTotal - totalDiscount + transportCost + miscCost;

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
                    <span className="text-muted-foreground">Total Discount</span>
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
            </CardContent>
        </Card>
    )
}


export default function AddStockPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            supplierName: "",
            supplierContact: "",
            products: [{ productName: "", category: "Feed", unit: "bag", ratePerUnit: 0, discount: 0, quantity: 1, unitWeight: 50, lowStockThreshold: 10 }],
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

    const paymentMethod = form.watch("paymentMethod");

    async function onSubmit(values: FormValues) {
        if (!firestore || !user) {
            toast({ title: "Error", description: "You must be logged in to add stock.", variant: "destructive" });
            return;
        }

        try {
            // 1. Add each product to the dealer's inventory
            for (const product of values.products) {
                const newItem: Omit<DealerInventoryItem, 'id' | 'dealerUID' | 'updatedAt'> = {
                    productName: product.productName,
                    category: product.category,
                    quantity: product.quantity,
                    unit: product.unit,
                    ratePerUnit: product.ratePerUnit,
                    unitWeight: product.unitWeight,
                    lowStockThreshold: product.lowStockThreshold,
                    phaseApplicable: [], // Default empty for now
                };
                await addDealerInventoryItem(firestore, user.uid, newItem);
            }
            
            // 2. Add a single debit entry to the ledger for the total purchase amount
            const netPayable = values.products.reduce((acc, p) => acc + (p.ratePerUnit * p.quantity), 0) 
                             - values.products.reduce((acc, p) => acc + p.discount, 0)
                             + values.transportCost + values.miscCost;

            const ledgerDescription = `Purchase from ${values.supplierName || 'Unknown Supplier'}` + (values.invoiceNumber ? ` (Bill: ${values.invoiceNumber})` : '');
            
            await addLedgerEntry(firestore, user.uid, {
                description: ledgerDescription,
                amount: netPayable,
                date: new Date(values.invoiceDate).toISOString(),
            }, 'Debit');
            
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Supplier & Product Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField name="supplierName" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Supplier Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g., National Feed Corp" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField name="supplierContact" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Supplier Contact</FormLabel>
                                                    <FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <Separator />
                                        
                                        <div className="space-y-4">
                                            <Label>Products</Label>
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 p-4 border rounded-md relative">
                                                    <div className="col-span-12 md:col-span-6">
                                                        <FormField name={`products.${index}.productName`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Product Name</FormLabel>
                                                                <FormControl><Input placeholder="e.g., Broiler Starter" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                     <div className="col-span-12 md:col-span-6">
                                                         <FormField name={`products.${index}.category`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Category</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="Feed">Feed</SelectItem>
                                                                        <SelectItem value="Medicine">Medicine</SelectItem>
                                                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                                                        <SelectItem value="Chicks">Chicks</SelectItem>
                                                                        <SelectItem value="Other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-6 md:col-span-2">
                                                         <FormField name={`products.${index}.quantity`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Quantity</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-6 md:col-span-2">
                                                        <FormField name={`products.${index}.unit`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Unit</FormLabel>
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
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-6 md:col-span-2">
                                                        <FormField name={`products.${index}.ratePerUnit`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Rate/Unit (₹)</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                     <div className="col-span-6 md:col-span-2">
                                                        <FormField name={`products.${index}.discount`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Discount (₹)</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-6 md:col-span-2">
                                                         <FormField name={`products.${index}.unitWeight`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Unit Wt. (kg)</FormLabel>
                                                                <FormControl><Input type="number" placeholder="Optional" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                     <div className="col-span-6 md:col-span-2">
                                                         <FormField name={`products.${index}.lowStockThreshold`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Low Stock At</FormLabel>
                                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <div className="col-span-12 md:col-span-12 text-right -mb-2">
                                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => remove(index)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <Button type="button" variant="outline" onClick={() => append({ productName: "", category: "Feed", unit: "bag", ratePerUnit: 0, discount: 0, quantity: 1, unitWeight: 50, lowStockThreshold: 10 })}>
                                            <PlusCircle className="mr-2" />
                                            Add Another Product
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Payment & Costs</CardTitle>
                                    </CardHeader>
                                     <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField name="transportCost" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transport Cost (Optional)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField name="miscCost" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Other Costs (Optional)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="e.g., Labour" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                </FormItem>
                                            )} />
                                        </div>
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
                            </div>

                            <div className="lg:col-span-1 space-y-8">
                                <SummaryCard control={form.control} />
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Invoice Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
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
