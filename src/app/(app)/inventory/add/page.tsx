
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase/provider";
import { currentUser } from "@/lib/data";
import { addInventoryItem, type InventoryItem } from "@/hooks/use-inventory";
import { useRouter } from "next/navigation";
import { CalendarIcon, Save } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  // Supplier
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  // Product
  productName: z.string().min(2, "Product name is required."),
  category: z.enum(["Chicks", "Feed", "Medicine", "Equipment", "Supplements", "Bedding", "Sanitizers", "Other"]),
  // Purchase
  quantity: z.coerce.number().min(0, "Quantity must be non-negative."),
  unit: z.enum(["kg", "grams", "liters", "ml", "units"]),
  // Pricing
  priceType: z.enum(['mrp', 'ex_factory']),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  // Payment
  paymentMethod: z.enum(['cash', 'credit', 'bank_transfer']),
  amountPaid: z.coerce.number().min(0),
  utrNumber: z.string().optional(),
  // Invoice
  invoiceDate: z.date(),
  invoiceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPurchasePage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const user = currentUser;
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            category: "Feed",
            unit: "kg",
            priceType: "mrp",
            price: 0,
            discount: 0,
            paymentMethod: "cash",
            amountPaid: 0,
            invoiceDate: new Date(),
        },
    });

    const paymentMethod = form.watch("paymentMethod");

    async function onSubmit(values: FormValues) {
        if (!firestore || !user) {
            toast({ title: "Error", description: "Could not add purchase.", variant: "destructive" });
            return;
        }

        const newItem: Omit<InventoryItem, 'id' | 'farmerUID' | 'lastUpdated'> = {
            productName: values.productName,
            category: values.category,
            stockQuantity: values.quantity,
            unit: values.unit,
            lowStockThreshold: 10, // Default for now
        };

        try {
            await addInventoryItem(firestore, user.id, newItem);
            // In a real app, you would also create a ledger entry for the payment
            toast({
                title: "Purchase Recorded",
                description: `${values.productName} has been added to your inventory.`,
            });
            router.push('/inventory');
        } catch (error) {
             toast({ title: "Error", description: "Failed to add purchase.", variant: "destructive" });
             console.error("Failed to add purchase", error)
        }
    }

    return (
        <>
            <PageHeader title="Add New Purchase" description="Record a new inward entry for feed or medicine." />
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
                                    <CardContent className="space-y-4">
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
                                         <FormField name="productName" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., Broiler Starter Pellets" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                             <FormField name="category" control={form.control} render={({ field }) => (
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
                                             <FormField name="quantity" control={form.control} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                             <FormField name="unit" control={form.control} render={({ field }) => (
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
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
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
                                                    <FormControl><Input type="number" placeholder="e.g., 2500" {...field} /></FormControl>
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pricing</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
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
                                        <FormField name="price" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price per Unit (₹)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="discount" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discount (₹)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
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
                                    </CardContent>
                                </Card>
                                 <Button type="submit" size="lg" className="w-full">
                                    <Save className="mr-2" />
                                    Save Purchase
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}

    