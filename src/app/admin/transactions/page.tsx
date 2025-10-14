
// src/app/admin/transactions/page.tsx
"use client";

import { useState } from "react";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2, Users as UsersIcon } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useLedger } from "@/hooks/use-ledger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LedgerEntry } from "@/lib/types";

function LedgerDetails({ userId, userName }: { userId: string, userName: string }) {
    const { entries, loading } = useLedger(userId);

    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin" /></div>;
    }
    
    if (entries.length === 0) {
         return <div className="text-center text-muted-foreground py-8">No transactions found for {userName}.</div>;
    }

    const finalBalance = entries.length > 0 ? entries[0].balanceAfter : 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Transactions for {userName}</CardTitle>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Final Balance</div>
                        <div className={`text-xl font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                            ₹{finalBalance.toLocaleString()}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map(txn => (
                            <TableRow key={txn.id}>
                                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{txn.description}</TableCell>
                                <TableCell className="text-right text-destructive">
                                    {txn.type === 'Debit' ? `₹${txn.amount.toFixed(2)}` : '—'}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                    {txn.type === 'Credit' ? `₹${txn.amount.toFixed(2)}` : '—'}
                                </TableCell>
                                <TableCell className="text-right font-semibold">₹{txn.balanceAfter.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function TransactionsPage() {
    const { users, loading: usersLoading } = useUsers();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <>
            <PageHeader title="All Transactions" description="View and manage all transactions across the platform.">
                <Button variant="outline" disabled={!selectedUserId}>
                    <FileDown className="mr-2" />
                    Export Ledger
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>View User Ledger</CardTitle>
                        <CardDescription>Select a user to view their complete transaction history.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="max-w-sm">
                            <Select onValueChange={setSelectedUserId} disabled={usersLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={usersLoading ? "Loading users..." : "Select a user..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className="flex items-center gap-2">
                                                <UsersIcon className="size-4 text-muted-foreground" />
                                                <span>{user.name} ({user.role})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {selectedUser && (
                           <LedgerDetails userId={selectedUser.id} userName={selectedUser.name} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
