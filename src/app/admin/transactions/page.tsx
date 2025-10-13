
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, MoreHorizontal, Loader2 } from "lucide-react";
import { useLedger } from "@/hooks/use-ledger";
import { useUsers } from "@/hooks/use-users";

export default function TransactionsPage() {
    const { entries: allTransactions, loading: ledgerLoading } = useLedger(); // Fetches all entries if no user ID
    const { users, loading: usersLoading } = useUsers();

    const loading = ledgerLoading || usersLoading;

    const getUserInfo = (userId: string) => {
        return users.find(u => u.id === userId);
    };

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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && allTransactions.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && allTransactions.map(txn => {
                                    const user = getUserInfo(txn.userId);
                                    if (!user) return null; // Only render if user info is available
                                    return (
                                    <TableRow key={txn.id} className="cursor-pointer">
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{txn.description}</TableCell>
                                        <TableCell>₹{txn.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={txn.type === 'Debit' ? 'destructive' : 'default'}>{txn.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(txn.date).toLocaleDateString()}
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
