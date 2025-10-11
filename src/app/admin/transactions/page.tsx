
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUsers } from "@/lib/data";
import { FileDown, MoreHorizontal } from "lucide-react";

const transactions = [
    { id: 'txn_1', user: mockUsers[1], plan: 'Farmer Plan', amount: 'INR 199', status: 'Success', date: '2023-10-28' },
    { id: 'txn_2', user: mockUsers[3], plan: 'Dealer Plan', amount: 'INR 499', status: 'Success', date: '2023-10-28' },
    { id: 'txn_3', user: mockUsers[2], plan: 'Farmer Plan', amount: 'INR 199', status: 'Failed', date: '2023-10-27' },
    { id: 'txn_4', user: mockUsers[4], plan: 'Farmer Plan', amount: 'INR 199', status: 'Success', date: '2023-10-27' },
     { id: 'txn_5', user: mockUsers[5], plan: 'Dealer Plan', amount: 'INR 499', status: 'Success', date: '2023-10-26' },
];

const statusVariant = {
    Success: "default",
    Failed: "destructive",
    Pending: "secondary",
} as const;

export default function TransactionsPage() {
    return (
        <>
            <PageHeader title="Transactions" description="View and manage all user transactions and subscriptions.">
                <Button variant="outline">
                    <FileDown className="mr-2" />
                    Export All
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>A list of the most recent transactions from all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(txn => (
                                    <TableRow key={txn.id}>
                                        <TableCell>
                                            <div className="font-medium">{txn.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{txn.user.email}</div>
                                        </TableCell>
                                        <TableCell>{txn.plan}</TableCell>
                                        <TableCell>{txn.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[txn.status as keyof typeof statusVariant]}>{txn.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(txn.date).toLocaleDateString('en-CA')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Refund</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
