// src/app/dealer/my-inventory/page.tsx
"use client";

import Link from 'next/link';
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Loader2, Edit } from 'lucide-react';
import { useAppUser } from '@/app/app-provider';
import { useDealerInventory, type DealerInventoryItem } from '@/hooks/use-dealer-inventory';
import { useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EditStockDialog } from './_components/edit-stock-dialog';

export default function MyInventoryPage() {
    const {user: dealerUser} = useAppUser();
    const { inventory, loading } = useDealerInventory(dealerUser?.id);
    const [selectedItem, setSelectedItem] = useState<DealerInventoryItem | null>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    const inventoryBySupplier = useMemo(() => {
        const grouped: { [key: string]: DealerInventoryItem[] } = {};
        inventory.forEach(item => {
            const supplierName = item.supplierName || 'No Supplier';
            if (!grouped[supplierName]) {
                grouped[supplierName] = [];
            }
            grouped[supplierName].push(item);
        });
        return grouped;
    }, [inventory]);

    const handleEditClick = (item: DealerInventoryItem) => {
        setSelectedItem(item);
        setEditDialogOpen(true);
    };

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

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

            <div className="mt-8 space-y-8">
                 {loading ? (
                    <div className="flex justify-center items-center h-64">
                         <Loader2 className="mx-auto animate-spin" />
                    </div>
                ) : Object.keys(inventoryBySupplier).length === 0 ? (
                     <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            No inventory items found. Click "Add Stock / Purchase" to get started.
                        </CardContent>
                    </Card>
                ) : Object.entries(inventoryBySupplier).map(([supplierName, items]) => {
                    const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.purchaseRatePerUnit), 0);
                    return (
                    <Card key={supplierName}>
                        <CardHeader>
                            <CardTitle>{supplierName}</CardTitle>
                            <CardDescription>
                                Total Stock Value from this supplier: <span className="font-bold text-primary">{formatCurrency(totalValue)}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead className="text-right">Purchase Rate</TableHead>
                                        <TableHead className="text-right">Sale Rate</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => {
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
                                                <TableCell className="text-right">{formatCurrency(item.purchaseRatePerUnit)}</TableCell>
                                                <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.ratePerUnit)}</TableCell>
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
                )})}
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
