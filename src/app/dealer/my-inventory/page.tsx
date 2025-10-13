
"use client";

import Link from 'next/link';
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Loader2, Edit } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { useDealerInventory, type DealerInventoryItem } from '@/hooks/use-dealer-inventory';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EditStockDialog } from './_components/edit-stock-dialog';

export default function MyInventoryPage() {
    const user = useUser();
    const { inventory, loading } = useDealerInventory(user.user?.uid);
    const [selectedItem, setSelectedItem] = useState<DealerInventoryItem | null>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    const handleEditClick = (item: DealerInventoryItem) => {
        setSelectedItem(item);
        setEditDialogOpen(true);
    };

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
                    <CardContent className="overflow-x-auto">
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
                                {!loading && inventory.map((item) => {
                                    const isLowStock = item.quantity <= item.lowStockThreshold;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                 {isLowStock && <Badge variant="destructive" className="mr-2">Low Stock</Badge>}
                                                {item.quantity.toLocaleString()} {item.unit}
                                                {item.unitWeight && ` (${item.unitWeight}kg)`}
                                            </TableCell>
                                            <TableCell className="text-right">₹{item.ratePerUnit.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Stock
                                                        </DropdownMenuItem>
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
            {selectedItem && (
                 <EditStockDialog
                    open={isEditDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    item={selectedItem}
                />
            )}
        </>
    );
}
