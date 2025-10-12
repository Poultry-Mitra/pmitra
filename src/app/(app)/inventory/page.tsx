
// src/app/(app)/inventory/page.tsx
"use client";

import { useState } from "react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useInventory, addInventoryItem } from "@/hooks/use-inventory";
import type { InventoryItem } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/data";
import { useFirestore } from "@/firebase/provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const formSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  category: z.enum(["Feed", "Medicine"]),
  stockQuantity: z.coerce.number().min(0, "Stock must be non-negative."),
  unit: z.enum(["kg", "grams", "liters", "ml", "units"]),
  lowStockThreshold: z.coerce.number().min(0, "Threshold must be non-negative."),
});

type FormValues = z.infer<typeof formSchema>;


function AddPurchaseDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const firestore = useFirestore();
  const user = currentUser;
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      category: "Feed",
      stockQuantity: 0,
      unit: "kg",
      lowStockThreshold: 10,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!firestore || !user) {
        toast({
            title: "Error",
            description: "Could not add item. User or database not available.",
            variant: "destructive",
        });
        return;
    }
    const newItem: Omit<InventoryItem, 'id' | 'farmerUID' | 'lastUpdated'> = {
        ...values
    };
    addInventoryItem(firestore, user.id, newItem);
    toast({
        title: "Purchase Added",
        description: `${values.productName} has been added to your inventory.`,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Manual Purchase</DialogTitle>
          <DialogDescription>
            Record a new feed or medicine purchase to add it to your inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Broiler Starter Feed" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
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
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="grams">grams</SelectItem>
                                        <SelectItem value="liters">liters</SelectItem>
                                        <SelectItem value="ml">ml</SelectItem>
                                        <SelectItem value="units">units</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Low Stock Alert Threshold</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button type="submit">Add to Inventory</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export default function InventoryPage() {
  const user = currentUser;
  const { inventory, loading } = useInventory(user.id);
  const [isAddPurchaseOpen, setAddPurchaseOpen] = useState(false);

  return (
    <>
      <PageHeader 
        title="Inventory"
        description="Manage your feed and medicine stock."
      >
        <Button onClick={() => setAddPurchaseOpen(true)}>
            <PlusCircle className="mr-2" />
            Add Purchase
        </Button>
      </PageHeader>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Current Stock</CardTitle>
                <CardDescription>A list of all items in your inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Stock Quantity</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <div className="flex justify-center items-center p-4">
                                        <Loader2 className="animate-spin mr-2" /> Loading inventory...
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && inventory.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center p-8">
                                    No inventory items found. Click "Add Purchase" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && inventory.map((item) => {
                          const isLowStock = item.stockQuantity < item.lowStockThreshold;
                          return(
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {isLowStock && <Badge variant="destructive" className="mr-2">Low Stock</Badge>}
                                    {item.stockQuantity.toLocaleString()} {item.unit}
                                </TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                                            <DropdownMenuItem>View History</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <AddPurchaseDialog open={isAddPurchaseOpen} onOpenChange={setAddPurchaseOpen} />
    </>
  );
}

