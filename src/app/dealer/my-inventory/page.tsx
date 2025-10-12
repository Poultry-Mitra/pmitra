
"use client";

import Link from 'next/link';
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { useDealerInventory } from '@/hooks/use-dealer-inventory';

export default function MyInventoryPage() {
    const user = useUser();
    const { inventory, loading } = useDealerInventory(user?.uid || '');

    return (
        <>
            <PageHeader
                title="My Inventory"
                description="Manage your stock of feed, medicine, chicks, and other products."
            >
                <Button asChild>
                    <Link href="/dealer/my-inventory/add">
                        <PlusCircle className="mr-2" />
                        Add Stock / Purchase
                    </Link>
                </Button>
            </PageHeader>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Stock</CardTitle>
                        <CardDescription>A list of all items currently in your inventory.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Rate (per unit)</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && inventory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No products found. Add a product to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && inventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.quantity.toLocaleString()} {item.unit}
                                            {item.unitWeight && ` (${item.unitWeight}kg)`}
                                        </TableCell>
                                        <TableCell className="text-right">₹{item.ratePerUnit.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
