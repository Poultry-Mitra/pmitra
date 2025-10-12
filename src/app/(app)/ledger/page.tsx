
// src/app/(app)/ledger/page.tsx
"use client";

import { useState } from "react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLedger } from "@/hooks/use-ledger";
import { useUser } from "@/firebase/provider";
import { cn } from "@/lib/utils";
import { AddExpenseDialog } from "./_components/add-expense-dialog";
import { AddIncomeDialog } from "./_components/add-income-dialog";

export default function LedgerPage() {
  const user = useUser();
  const { entries, loading } = useLedger(user?.uid || '');
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setAddIncomeOpen] = useState(false);


  const finalBalance = entries.length > 0 ? entries[0].balanceAfter : 0;

  return (
    <>
      <PageHeader 
        title="Financial Ledger"
        description="Track all your farm's debits and credits."
      >
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <div className={cn("text-2xl font-bold", finalBalance >= 0 ? "text-green-600" : "text-destructive")}>
                    <IndianRupee className="inline h-5 w-5 -mt-1" />
                    {loading ? <Loader2 className="inline-block h-6 w-6 animate-spin" /> : finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={() => setAddIncomeOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Add Income
                </Button>
                <Button onClick={() => setAddExpenseOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Add Expense
                </Button>
            </div>
        </div>
      </PageHeader>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A complete record of your financial activities, with the most recent transactions first.</CardDescription>
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
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="flex justify-center items-center p-4">
                                        <Loader2 className="animate-spin mr-2" /> Loading ledger...
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && entries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-8">
                                    No transactions found. Click "Add Purchase" in inventory or add a manual expense to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && entries.map((entry) => (
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
                          )
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setAddExpenseOpen} />
      <AddIncomeDialog open={isAddIncomeOpen} onOpenChange={setAddIncomeOpen} />
    </>
  );
}
