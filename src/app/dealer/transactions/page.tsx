
// src/app/dealer/transactions/page.tsx
"use client";

import { PageHeader } from "@/app/dealer/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUsers, currentDealer as dealerUser } from "@/lib/data";
import { FileDown, MoreHorizontal } from "lucide-react";
import { useClientState } from "@/hooks/use-client-state";
import type { User } from "@/lib/types";

// In a real app, this data would be fetched from Firestore
const allTransactions = [
    { id: 'txn_2', farmerUID: 'usr_farmer_004', plan: 'Order #ORD-2 Payment', amount: 'INR 22,500', status: 'Success', date: '2023-10-28' },
    { id: 'txn_3', farmerUID: 'usr_farmer_002', plan: 'Order #ORD-1 Payment', amount: 'INR 22,000', status: 'Pending', date: '2023-10-27' },
    { id: 'txn_5', farmerUID: 'usr_farmer_002', plan: 'Order #ORD-3 Payment', amount: 'INR 1,750', status: 'Failed', date: '2023-10-26' },
    { id: 'txn_6', farmerUID: 'usr_farmer_004', plan: 'Order #ORD-4 Payment', amount: 'INR 43,000', status: 'Success', date: '2023-10-25' },
    { id: 'txn_7', farmerUID: 'usr_farmer_002', plan: 'Advance Payment', amount: 'INR 10,000', status: 'Success', date: '2023-10-24' },
    // This is an admin-level transaction that a dealer should not see
    { id: 'txn_admin_1', farmerUID: 'usr_farmer_001', plan: 'Platform Fee', amount: 'INR 5,000', status: 'Success', date: '2023-10-23' },
];

const statusVariant = {
    Success: "default",
    Failed: "destructive",
    Pending: "secondary",
} as const;

export default function TransactionsPage() {
    const user = useClientState<User | undefined>(dealerUser);
    
    if (!user) {
         return <PageHeader title="Loading Transactions..." />;
    }

    const isAdmin = user.role === 'admin';
    const pageTitle = isAdmin ? "All Transactions" : "My Transactions";
    const pageDescription = isAdmin ? "View all transactions across the platform." : "View and manage all transactions related to your account.";

    // Filter transactions to show only those related to the dealer's connected farmers, or all for admin
    const transactions = isAdmin 
        ? allTransactions 
        : allTransactions.filter(txn => user.connectedFarmers?.includes(txn.farmerUID));


    const handleTransactionClick = (txn: any) => {
        const farmer = mockUsers.find(u => u.id === txn.farmerUID);
        alert(`Transaction Details:\n\nID: ${txn.id}\nFarmer: ${farmer?.name}\nAmount: ${txn.amount}\nStatus: ${txn.status}\nDate: ${txn.date}`);
    }

    return (
        <>
            <PageHeader title={pageTitle} description={pageDescription}>
                <Button variant="outline">
                    <FileDown className="mr-2" />
                    Export All
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>A list of the most recent payments and order transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Farmer/Customer</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(txn => {
                                    const farmer = mockUsers.find(u => u.id === txn.farmerUID);
                                    if (!farmer) return null;
                                    return (
                                        <TableRow key={txn.id} onClick={() => handleTransactionClick(txn)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="font-medium">{farmer.name}</div>
                                                <div className="text-sm text-muted-foreground">{farmer.email}</div>
                                            </TableCell>
                                            <TableCell>{txn.plan}</TableCell>
                                            <TableCell>{txn.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[txn.status as keyof typeof statusVariant]}>{txn.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(txn.date).toLocaleDateString('en-CA')}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
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
