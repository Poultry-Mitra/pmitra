
// src/app/(app)/inventory/page.tsx
"use client";

import Link from "next/link";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/use-inventory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/data";

export default function InventoryPage() {
  const user = currentUser;
  const { inventory, loading } = useInventory(user.id);

  return (
    <>
      <PageHeader 
        title="Inventory Stock"
        description="Manage your feed and medicine stock."
      >
        <Button asChild>
            <Link href="/inventory/add">
                <PlusCircle className="mr-2" />
                Add Purchase
            </Link>
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
    </>
  );
}
