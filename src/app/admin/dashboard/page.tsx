// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Bot, IndianRupee, Activity, PlusCircle, Send, Loader2 } from "lucide-react";
import { RevenueChart } from "../_components/revenue-chart";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserManagementSummary } from "../_components/user-management-summary";
import { useUsers } from "@/hooks/use-users";
import { useLanguage } from "@/components/language-provider";
import { useLedger } from "@/hooks/use-ledger";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LedgerEntry, User } from "@/lib/types";


function RecentTransactions({ transactions, users, loading }: { transactions: LedgerEntry[], users: User[], loading: boolean }) {
    const { t } = useLanguage();

    const getTransactionUser = (userId: string) => users.find(u => u.id === userId);

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>The last 5 transactions on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                            <div className="font-medium">{user?.name || 'Unknown'}</div>
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


export default function AdminDashboardPage() {
    const { users, loading: usersLoading } = useUsers();
    const { t } = useLanguage();
    const { entries: transactions, loading: ledgerLoading } = useLedger();

    const loading = usersLoading || ledgerLoading;

    const totalRevenue = useMemo(() => {
        if (loading) return 0;
        return transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
    }, [transactions, loading]);
    
    const aiChatsUsed = "0"; // Placeholder, needs real data source


    const adminKpiData = [
        {
            title: t('admin.dashboard.kpi_total_users'),
            value: loading ? <Loader2 className="animate-spin" /> : users.length,
            change: t('admin.dashboard.kpi_total_users_change'),
            icon: Users,
        },
        {
            title: t('admin.dashboard.kpi_total_revenue'),
            value: loading ? <Loader2 className="animate-spin" /> : `₹${totalRevenue.toLocaleString()}`,
            change: t('admin.dashboard.kpi_total_revenue_change'),
            icon: IndianRupee,
        },
        {
            title: t('admin.dashboard.kpi_ai_chats_used'),
            value: aiChatsUsed,
            change: t('admin.dashboard.kpi_ai_chats_used_change'),
            icon: Bot,
        },
        {
            title: t('admin.dashboard.kpi_platform_activity'),
            value: t('admin.dashboard.kpi_platform_activity_value'),
            change: t('admin.dashboard.kpi_platform_activity_change'),
            icon: Activity,
        },
    ];

    return (
        <>
            <PageHeader title={t('admin.dashboard.title')} description={t('admin.dashboard.description')}>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/notifications">
                            <Send className="mr-2" />
                            {t('admin.dashboard.send_notification_button')}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/user-management/add-user">
                            <PlusCircle className="mr-2" />
                            {t('admin.dashboard.add_user_button')}
                        </Link>
                    </Button>
                </div>
            </PageHeader>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {adminKpiData.map(kpi => (
                     <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">{kpi.change}</p>
                        </CardContent>
                    </Card>
               ))}
            </div>
             <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('admin.dashboard.revenue_analytics_title')}</CardTitle>
                        <CardDescription>{t('admin.dashboard.revenue_analytics_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart ledgerEntries={transactions} />
                    </CardContent>
                </Card>
                <div className="space-y-4">
                    <UserManagementSummary />
                    <RecentTransactions transactions={transactions} users={users} loading={loading} />
                </div>
            </div>
        </>
    )
}
