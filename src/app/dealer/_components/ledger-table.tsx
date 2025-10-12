
// src/app/dealer/_components/ledger-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LedgerEntry } from "@/lib/types";

export function LedgerTable({ entries }: { entries: LedgerEntry[] }) {
    if (entries.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">No transactions found.</div>;
    }

    return (
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
                {entries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell className="text-right text-destructive">
                            {entry.type === 'Debit' ? `₹${entry.amount.toFixed(2)}` : '—'}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                            {entry.type === 'Credit' ? `₹${entry.amount.toFixed(2)}` : '—'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            ₹{entry.balanceAfter.toFixed(2)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
