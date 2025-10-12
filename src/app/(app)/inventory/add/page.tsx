
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase/provider";
import { addInventoryItem, type InventoryItem } from "@/hooks/use-inventory";
import { addLedgerEntry } from "@/hooks/use-ledger";
import { useRouter } from "next/navigation";
import { CalendarIcon, Save, Trash2, PlusCircle, IndianRupee } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const productSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  category: z.enum(["Chicks", "Feed", "Medicine", "Equipment", "Supplements", "Bedding", "Sanitizers", "Other"]),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0."),
  unit: z.enum(["kg", "grams", "liters", "ml", "units"]),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
});

const formSchema = z.object({
  // Supplier
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  
  // Products Array
  products: z.array(productSchema).min(1, "Please add at least one product."),

  // Pricing
  priceType: z.enum(['mrp', 'ex_factory']),
  
  // Payment
  paymentMethod: z.enum(['cash', 'credit', 'bank_transfer']),
  amountPaid: z.coerce.number().min(0),
  utrNumber: z.string().optional(),
  
  // Invoice
  invoiceDate: z.date(),
  invoiceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SummaryCard({ control }: { control: any }) {
    const products = useWatch({ control, name: 'products' });
    const subTotal = products.reduce((acc: number, product: any) => acc + (product.price * product.quantity), 0);
    const totalDiscount = products.reduce((acc: number, product: any) => acc + product.discount, 0);
    const netPayable = subTotal - totalDiscount;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Discount</span>
                    <span className="font-medium text-destructive">- ₹{totalDiscount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Net Payable</span>
                    <span>₹{netPayable.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}


export default function AddPurchasePage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const user = useUser();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            supplierName: "",
            supplierContact: "",
            products: [{ productName: "", category: "Feed", unit: "kg", price: 0, discount: 0, quantity: 1 }],
            priceType: "mrp",
            paymentMethod: "cash",
            amountPaid: 0,
            utrNumber: "",
            invoiceDate: new Date(),
            invoiceNumber: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products"
    });

    const paymentMethod = form.watch("paymentMethod");
    const products = form.watch('products');
    const netPayable = products.reduce((acc, p) => acc + (p.price * p.quantity), 0) - products.reduce((acc, p) => acc + p.discount, 0);

    async function onSubmit(values: FormValues) {
        if (!firestore || !user) {
            toast({ title: "Error", description: "You must be logged in to add a purchase.", variant: "destructive" });
            return;
        }

        try {
            // 1. Add each product to the inventory
            for (const product of values.products) {
                const newItem: Omit<InventoryItem, 'id' | 'farmerUID' | 'lastUpdated'> = {
                    productName: product.productName,
                    category: product.category,
                    stockQuantity: product.quantity,
                    unit: product.unit,
                    lowStockThreshold: 10, // Default for now
                };
                await addInventoryItem(firestore, user.uid, newItem);
            }

            // 2. Add a single debit entry to the ledger for the total purchase amount
            const ledgerDescription = `Purchase from ${values.supplierName || 'Unknown Supplier'}` + (values.invoiceNumber ? ` (Bill: ${values.invoiceNumber})` : '');
            
            await addLedgerEntry(firestore, user.uid, {
                description: ledgerDescription,
                amount: netPayable,
                date: values.invoiceDate.toISOString(),
            }, 'Debit');
            
            toast({
                title: "Purchase Recorded",
                description: `${values.products.length} item(s) have been added to inventory and a debit entry created in your ledger.`,
            });
            router.push('/inventory');

        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Failed to record purchase and update ledger.", variant: "destructive" });
             console.error("Failed to add purchase", error)
        }
    }

    return (
        <>
            <PageHeader title="Add New Purchase" description="Record a new inward entry for feed, medicine, or chicks." />
            <div className="mt-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Supplier & Product Details</CardTitle>
                                        <CardDescription>Enter details about who you bought from and what you bought.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField name="supplierName" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Supplier Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g., Local Agro Center" {...field} /></FormControl>
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
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 p-4 border rounded-md relative">
                                                    <div className="col-span-12 md:col-span-6">
                                                        <FormField name={`products.${index}.productName`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Product Name</FormLabel>
                                                                <FormControl><Input placeholder="e.g., Broiler Starter Pellets" {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                     <div className="col-span-12 md:col-span-6">
                                                         <FormField name={`products.${index}.category`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Category</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="Chicks">Chicks</SelectItem>
                                                                        <SelectItem value="Feed">Feed</SelectItem>
                                                                        <SelectItem value="Medicine">Medicine</SelectItem>
                                                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                                                        <SelectItem value="Supplements">Supplements</SelectItem>
                                                                        <SelectItem value="Bedding">Bedding</SelectItem>
                                                                        <SelectItem value="Sanitizers">Sanitizers</SelectItem>
                                                                        <SelectItem value="Other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3">
                                                         <FormField name={`products.${index}.quantity`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity</FormLabel>
                                                                <FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3">
                                                        <FormField name={`products.${index}.unit`} control={form.control} render={({ field }) => (
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
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3">
                                                        <FormField name={`products.${index}.price`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Price/Unit</FormLabel>
                                                                <FormControl><Input type="number" placeholder="₹" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                     <div className="col-span-6 md:col-span-3">
                                                        <FormField name={`products.${index}.discount`} control={form.control} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Discount</FormLabel>
                                                                <FormControl><Input type="number" placeholder="₹" {...field} /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <div className="col-span-12 text-right">
                                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <Button type="button" variant="outline" onClick={() => append({ productName: "", category: "Feed", unit: "kg", price: 0, discount: 0, quantity: 1 })}>
                                            <PlusCircle className="mr-2" />
                                            Add Product
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Details</CardTitle>
                                        <CardDescription>How much did you pay and how?</CardDescription>
                                    </CardHeader>
                                     <CardContent className="space-y-4">
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
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                             <FormField name="amountPaid" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount Paid</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input type="number" className="pl-8" placeholder="e.g., 2500" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                         {paymentMethod === 'bank_transfer' && (
                                            <FormField name="utrNumber" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>UTR / Transaction ID</FormLabel>
                                                    <FormControl><Input placeholder="Enter bank transaction reference" {...field} /></FormControl>
                                                    <FormMessage />
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
                                        <CardTitle>Invoice</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                         <FormField name="invoiceDate" control={form.control} render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Invoice/Bill Date</FormLabel>
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
                                         )} />
                                        <FormField name="invoiceNumber" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Invoice/Bill No.</FormLabel>
                                                <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                         <FormField name="priceType" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="mrp">MRP</SelectItem>
                                                        <SelectItem value="ex_factory">Ex-Factory</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                                 <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                                    <Save className="mr-2" />
                                    {form.formState.isSubmitting ? "Saving..." : "Save Purchase"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}

    
