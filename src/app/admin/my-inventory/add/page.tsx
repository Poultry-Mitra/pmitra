
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../_components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters."),
  category: z.enum(["Feed", "Medicine", "Equipment", "Chicks"]),
  unit: z.enum(["bag", "packet", "bottle", "pcs", "chick"]),
  stockQuantity: z.coerce.number().int().min(0, "Stock must be a non-negative number."),
  ratePerUnit: z.coerce.number().min(0, "Rate must be a non-negative number."),
  unitWeight: z.coerce.number().optional(),
  phases: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const phases = [
  { id: 'Pre-Starter', label: 'Pre-Starter' },
  { id: 'Starter', label: 'Starter' },
  { id: 'Finisher', label: 'Finisher' },
];

export default function AddInventoryProductPage() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            category: "Feed",
            unit: "bag",
            stockQuantity: 0,
            ratePerUnit: 0,
            phases: [],
        },
    });

    const category = form.watch("category");

    async function onSubmit(values: FormValues) {
        console.log("Form Submitted", values);
        // In a real app, you would save this to Firestore
        // e.g., await addDealerInventoryItem(firestore, dealerId, values);
        
        toast({
            title: "Product Added",
            description: `"${values.productName}" has been added to your inventory.`,
        });
        router.push('/admin/my-inventory');
    }

    return (
        <>
            <PageHeader title="Add New Product" description="Add a new product to your dealer inventory." />
            <div className="mt-8 max-w-2xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                                <CardDescription>Fill in the details for the new product.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="productName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Broiler Starter Pellets" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Feed">Feed</SelectItem>
                                                        <SelectItem value="Medicine">Medicine</SelectItem>
                                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                                        <SelectItem value="Chicks">Chicks</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
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
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="stockQuantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock Quantity</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="ratePerUnit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rate per Unit (₹)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {category === 'Feed' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <FormField
                                            control={form.control}
                                            name="unitWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Weight (kg)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="e.g., 50 for a 50kg bag" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="phases"
                                            render={() => (
                                                <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">Applicable Phases</FormLabel>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    {phases.map((item) => (
                                                        <FormField
                                                            key={item.id}
                                                            control={form.control}
                                                            name="phases"
                                                            render={({ field }) => {
                                                                return (
                                                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(item.id)}
                                                                            onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), item.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                                                </FormItem>
                                                                );
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                <Button type="submit" size="lg" className="w-full">
                                    <Save className="mr-2" />
                                    Save Product
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </>
    );
}
