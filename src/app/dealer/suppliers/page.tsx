
// src/app/dealer/suppliers/page.tsx
"use client";

import { useState } from 'react';
import { PageHeader } from "../_components/page-header";
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useUser } from '@/firebase/provider';
import { AddSupplierDialog } from './_components/add-supplier-dialog';

export default function SuppliersPage() {
    const { user } = useUser();
    const { suppliers, loading } = useSuppliers(user?.uid);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);

    return (
        <>
            <PageHeader
                title="My Suppliers"
                description="Manage the list of suppliers you purchase from."
            >
                <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Add New Supplier
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>All Suppliers</CardTitle>
                        <CardDescription>A list of all your registered suppliers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Contact Number</TableHead>
                                    <TableHead>GSTIN</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : suppliers.length === 0 ? (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No suppliers found. Click "Add New Supplier" to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.map(supplier => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">{supplier.name}</TableCell>
                                            <TableCell>{supplier.contactPerson || '—'}</TableCell>
                                            <TableCell>{supplier.contactNumber || '—'}</TableCell>
                                            <TableCell>{supplier.gstin || '—'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <AddSupplierDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
        </>
    )
}
