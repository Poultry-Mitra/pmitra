

"use client";

import { useState, useContext } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "../../../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart } from "lucide-react";
import { useDealerInventory, type DealerInventoryItem } from "@/hooks/use-dealer-inventory";
import { CreateOrderDialog } from "./_components/create-order-dialog";
import { useUsersByIds } from "@/hooks/use-users";

export default function DealerProductsPage() {
    const params = useParams();
    const dealerId = params.dealerId as string;
    const { inventory, loading: inventoryLoading } = useDealerInventory(dealerId);
    const { users: dealers, loading: dealerLoading } = useUsersByIds([dealerId]);
    
    const [selectedProduct, setSelectedProduct] = useState<DealerInventoryItem | null>(null);
    const [isOrderDialogOpen, setOrderDialogOpen] = useState(false);

    const handleOrderClick = (product: DealerInventoryItem) => {
        setSelectedProduct(product);
        setOrderDialogOpen(true);
    };

    const dealer = dealers[0];
    const loading = inventoryLoading || dealerLoading;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" />
            </div>
        );
    }
    
    if (!dealer) {
         return <PageHeader title="Dealer not found" />;
    }

    return (
        <>
            <PageHeader
                title={`Products from ${dealer.name}`}
                description="Browse and order products directly from your connected dealer."
            />

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Available Products</CardTitle>
                        <CardDescription>
                            Showing all products available from {dealer.name}. Stock levels are updated in real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Available Stock</TableHead>
                                    <TableHead className="text-right">Rate (per unit)</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
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
                                            This dealer has no products available at the moment.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && inventory.map((item) => {
                                    const isOutOfStock = item.quantity <= 0;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {isOutOfStock ? (
                                                     <Badge variant="destructive">Out of Stock</Badge>
                                                ) : (
                                                    `${item.quantity.toLocaleString()} ${item.unit}`
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">₹{item.ratePerUnit.toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleOrderClick(item)} 
                                                    disabled={isOutOfStock}
                                                >
                                                    <ShoppingCart className="mr-2" />
                                                    Order Now
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            {selectedProduct && dealer && (
                <CreateOrderDialog
                    open={isOrderDialogOpen}
                    onOpenChange={setOrderDialogOpen}
                    product={selectedProduct}
                    dealer={dealer}
                />
            )}
        </>
    );
}
