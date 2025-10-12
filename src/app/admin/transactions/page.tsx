
// src/app/admin/transactions/page.tsx
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUsers, currentDealer } from "@/lib/data";
import { FileDown, MoreHorizontal } from "lucide-react";

// In a real app, this data would be fetched from Firestore based on the currentDealer's UID
const allTransactions = [
    { id: 'txn_2', farmerUID: 'usr_farmer_004', plan: 'Order #ORD-2 Payment', amount: 'INR 22,500', status: 'Success', date: '2023-10-28' },
    { id: 'txn_3', farmerUID: 'usr_farmer_002', plan: 'Order #ORD-1 Payment', amount: 'INR 22,000', status: 'Pending', date: '2023-10-27' },
    { id: 'txn_5', farmerUID: 'usr_farmer_002', plan: 'Order #ORD-3 Payment', amount: 'INR 1,750', status: 'Failed', date: '2023-10-26' },
    { id: 'txn_6', farmerUID: 'usr_farmer_004', plan: 'Order #ORD-4 Payment', amount: 'INR 43,000', status: 'Success', date: '2023-10-25' },
    { id: 'txn_7', farmerUID: 'usr_farmer_002', plan: 'Advance Payment', amount: 'INR 10,000', status: 'Success', date: '2023-10-24' },
];

const statusVariant = {
    Success: "default",
    Failed: "destructive",
    Pending: "secondary",
} as const;

export default function TransactionsPage() {
    const currentUser = currentDealer;
    
    if (!currentUser) return null;

    const isAdmin = currentUser.role === 'admin';
    const pageTitle = isAdmin ? "All Transactions" : "My Transactions";
    const pageDescription = isAdmin ? "View all transactions across the platform." : "View and manage all transactions related to your account.";

    // Filter transactions to show only those related to the dealer's connected farmers
    const transactions = isAdmin 
        ? allTransactions 
        : allTransactions.filter(txn => currentUser.connectedFarmers?.includes(txn.farmerUID));


    const handleTransactionClick = (txn: any) => {
        const user = mockUsers.find(u => u.id === txn.farmerUID);
        alert(`Transaction Details:\n\nID: ${txn.id}\nFarmer: ${user?.name}\nAmount: ${txn.amount}\nStatus: ${txn.status}\nDate: ${txn.date}`);
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
                                    const user = mockUsers.find(u => u.id === txn.farmerUID);
                                    if (!user) return null;
                                    return (
                                        <TableRow key={txn.id} onClick={() => handleTransactionClick(txn)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
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
