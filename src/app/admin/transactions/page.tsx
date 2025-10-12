
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUsers } from "@/lib/data";
import { FileDown, MoreHorizontal } from "lucide-react";

// In a real app, this data would be fetched from Firestore
const allTransactions = [
    { id: 'txn_1', user: mockUsers.find(u => u.id === 'usr_farmer_002'), plan: 'Premium Farmer (Monthly)', amount: 'INR 249', status: 'Success', date: '2023-11-01' },
    { id: 'txn_2', user: mockUsers.find(u => u.id === 'usr_dealer_003'), plan: 'Order #ORD-1 Payment', amount: 'INR 22,500', status: 'Success', date: '2023-10-28' },
    { id: 'txn_3', user: mockUsers.find(u => u.id === 'usr_farmer_004'), plan: 'Premium Farmer (Yearly)', amount: 'INR 2,499', status: 'Pending', date: '2023-10-27' },
    { id: 'txn_4', user: mockUsers.find(u => u.id === 'usr_dealer_005'), plan: 'Premium Dealer (Monthly)', amount: 'INR 499', status: 'Success', date: '2023-10-27' },
    { id: 'txn_5', user: mockUsers.find(u => u.id === 'usr_farmer_002'), plan: 'Order #ORD-3 Payment', amount: 'INR 1,750', status: 'Failed', date: '2023-10-26' },
];

const statusVariant = {
    Success: "default",
    Failed: "destructive",
    Pending: "secondary",
} as const;

export default function TransactionsPage() {
    
    const handleTransactionClick = (txn: any) => {
        alert(`Transaction Details:\n\nID: ${txn.id}\nUser: ${txn.user.name}\nPlan: ${txn.plan}\nAmount: ${txn.amount}\nStatus: ${txn.status}\nDate: ${txn.date}`);
    }

    return (
        <>
            <PageHeader title="All Transactions" description="View and manage all transactions across the platform.">
                <Button variant="outline">
                    <FileDown className="mr-2" />
                    Export All
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>A list of the most recent payments, subscriptions, and order transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allTransactions.map(txn => {
                                    if (!txn.user) return null;
                                    return (
                                    <TableRow key={txn.id} onClick={() => handleTransactionClick(txn)} className="cursor-pointer">
                                        <TableCell>
                                            <div className="font-medium">{txn.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{txn.user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={txn.user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{txn.user.role}</Badge>
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
                                                    <DropdownMenuItem>Issue Refund</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
