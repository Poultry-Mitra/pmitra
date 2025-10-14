

// src/app/dealer/transactions/page.tsx
"use client";

import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import { useLedger } from "@/hooks/use-ledger";
import { LedgerTable } from "../_components/ledger-table";
import { useLanguage } from "@/components/language-provider";
import { useAppUser } from "@/app/app-provider";

export default function TransactionsPage() {
    const { user: firebaseUser, loading: isUserLoading } = useAppUser();
    const { entries, loading: ledgerLoading } = useLedger(firebaseUser?.id);
    const loading = isUserLoading || ledgerLoading;
    const { t } = useLanguage();

    return (
        <>
            <PageHeader title={t('dealer.ledger')} description="A complete record of your financial activities.">
                <Button variant="outline">
                    <FileDown className="mr-2" />
                    Export All
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Shows all sales, purchases, and other transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : <LedgerTable entries={entries} />}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
