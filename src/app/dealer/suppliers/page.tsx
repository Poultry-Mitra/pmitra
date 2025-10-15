// src/app/dealer/suppliers/page.tsx
"use client";

import { useState } from 'react';
import { PageHeader } from "../_components/page-header";
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useLanguage } from '@/components/language-provider';
import { useAppUser } from '@/app/app-provider';
import Link from 'next/link';

export default function SuppliersPage() {
    const { user } = useAppUser();
    const { suppliers, loading } = useSuppliers(user?.id);
    const { t } = useLanguage();

    return (
        <>
            <PageHeader
                title={t('dealer.suppliers')}
                description="Manage the list of suppliers you purchase from."
            >
                <Button asChild>
                    <Link href="/dealer/suppliers/add">
                        <PlusCircle className="mr-2" />
                        Add New Supplier
                    </Link>
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>All Suppliers</CardTitle>
                        <CardDescription>
                            A list of all your registered suppliers. To add items to your inventory, 
                            <Link href="/dealer/my-inventory/add" className="text-primary hover:underline font-medium"> create a new purchase</Link>.
                        </CardDescription>
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
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            You haven't added any suppliers yet. Click the "Add New Supplier" button to get started.
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
        </>
    )
}
