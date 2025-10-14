
// src/app/admin/dashboard/_components/recent-transactions.tsx
"use client";

import { useLedger } from "@/hooks/use-ledger";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { LedgerEntry, User } from "@/lib/types";


export function RecentTransactions({ users, loading: usersLoading }: { users: User[], loading: boolean }) {
    const { entries: transactions, loading: ledgerLoading } = useLedger(); // Fetches all ledger entries
    const loading = usersLoading || ledgerLoading;

    const getTransactionUser = (userId: string) => users.find(u => u.id === userId);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>The last 5 transactions on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.slice(0, 5).map(tx => {
                                const user = getTransactionUser(tx.userId);
                                return (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="font-medium">{user?.name || 'Unknown User'}</div>
                                            <div className="text-xs text-muted-foreground">{user?.email || ''}</div>
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${tx.type === 'Credit' ? 'text-green-600' : 'text-destructive'}`}>
                                            {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                             {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">No transactions yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
