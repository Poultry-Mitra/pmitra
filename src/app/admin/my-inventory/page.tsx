
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import type { DealerInventoryItem } from '@/lib/types';

// Mock data for now, this would come from Firestore
const mockInventory: DealerInventoryItem[] = [
    { id: '1', dealerUID: 'usr_dealer_003', category: 'Feed', productName: 'Broiler Starter Crumble', unit: 'bag', unitWeight: 50, stockQuantity: 120, ratePerUnit: 2200, phaseApplicable: ['Starter'], updatedAt: new Date() },
    { id: '2', dealerUID: 'usr_dealer_003', category: 'Feed', productName: 'Broiler Finisher Pellets', unit: 'bag', unitWeight: 50, stockQuantity: 80, ratePerUnit: 2150, phaseApplicable: ['Finisher'], updatedAt: new Date() },
    { id: '3', dealerUID: 'usr_dealer_003', category: 'Chicks', productName: 'Cobb 430Y Chicks', unit: 'chick', stockQuantity: 5000, ratePerUnit: 45, updatedAt: new Date() },
    { id: '4', dealerUID: 'usr_dealer_003', category: 'Medicine', productName: 'Vimeral Liquid', unit: 'bottle', stockQuantity: 50, ratePerUnit: 350, updatedAt: new Date() },
];

export default function MyInventoryPage() {
    const [inventory, setInventory] = useState(mockInventory);

    return (
        <>
            <PageHeader
                title="My Inventory"
                description="Manage your stock of feed, medicine, chicks, and other products."
            >
                <Button asChild>
                    <Link href="/admin/my-inventory/add">
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
                                {inventory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No products found. Add a product to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {inventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.stockQuantity.toLocaleString()} {item.unit}
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

    