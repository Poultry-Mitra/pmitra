
// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Bot, IndianRupee, Activity, PlusCircle, Send, Loader2, ShoppingBag } from "lucide-react";
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
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { useOrders } from "@/hooks/use-orders";
import { Skeleton } from "@/components/ui/skeleton";


function Sparkline({ data, color }: { data: { value: number }[], color: string }) {
    if (!data || data.length === 0) return <div className="h-10 w-20" />;
    return (
        <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                        <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

function KpiCard({ title, value, change, changeColor, icon: Icon, chartData, chartColor }: { title: string, value: string | number, change: string, changeColor: string, icon: React.ElementType, chartData: {value: number}[], chartColor: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className={`text-xs ${changeColor}`}>
                            {change}
                        </p>
                    </div>
                    <Sparkline data={chartData} color={chartColor} />
                </div>
            </CardContent>
        </Card>
    );
}

function RecentTransactions({ transactions, users, loading }: { transactions: LedgerEntry[], users: User[], loading: boolean }) {
    const { t } = useLanguage();

    const getTransactionUser = (userId: string) => users.find(u => u.id === userId);

    return (
        <Card className="lg:col-span-1">
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
    // We need to fetch all orders for the active orders KPI
    const { orders, loading: ordersLoading } = useOrders(); 

    const loading = usersLoading || ledgerLoading || ordersLoading;

    const kpiData = useMemo(() => {
        if (loading) return null;
        
        const totalRevenue = transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
        
        return {
            totalUsers: users.length,
            totalRevenue: totalRevenue,
            aiChatsUsed: "0", // Placeholder for now
            activeOrders: orders.filter(o => o.status === 'Pending').length,
        };
    }, [users, transactions, orders, loading]);


    return (
        <>
            <PageHeader title={t('admin.dashboard.title')} description={t('admin.dashboard.description')}>
                <div className="flex items-center gap-2 flex-wrap">
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
               {loading || !kpiData ? (
                   [...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-1/2 mt-4" />
                                <Skeleton className="h-3 w-1/3 mt-1" />
                            </CardContent>
                        </Card>
                   ))
               ) : (
                   <>
                        <KpiCard 
                            title={t('admin.dashboard.kpi_total_users')}
                            value={kpiData.totalUsers} 
                            change={t('admin.dashboard.kpi_total_users_change')}
                            changeColor="text-muted-foreground"
                            icon={Users}
                            chartData={[{ value: 1 }, { value: 2 }, { value: kpiData.totalUsers }]}
                            chartColor="hsl(var(--chart-1))"
                        />
                        <KpiCard 
                            title="Active Orders" 
                            value={kpiData.activeOrders} 
                            change="Pending Approval"
                            changeColor="text-muted-foreground"
                            icon={ShoppingBag}
                            chartData={[{ value: 2 }, { value: 1 }, { value: kpiData.activeOrders }]}
                            chartColor="hsl(var(--chart-2))"
                        />
                        <KpiCard 
                            title={t('admin.dashboard.kpi_total_revenue')}
                            value={`₹${kpiData.totalRevenue.toLocaleString()}`} 
                            change={t('admin.dashboard.kpi_total_revenue_change')}
                            changeColor="text-green-500"
                            icon={IndianRupee}
                            chartData={[{ value: 10000 }, { value: 12000 }, { value: 15000 }, { value: kpiData.totalRevenue }]}
                            chartColor="hsl(var(--chart-1))"
                        />
                         <KpiCard 
                            title={t('admin.dashboard.kpi_ai_chats_used')}
                            value={kpiData.aiChatsUsed}
                            change={t('admin.dashboard.kpi_ai_chats_used_change')}
                            changeColor="text-muted-foreground"
                            icon={Bot}
                            chartData={[{ value: 5 }, { value: 8 }, { value: 6 }, { value: 10 }]}
                            chartColor="hsl(var(--chart-2))"
                        />
                   </>
               )}
            </div>
             <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('admin.dashboard.revenue_analytics_title')}</CardTitle>
                        <CardDescription>{t('admin.dashboard.revenue_analytics_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <div className="flex h-[300px] w-full items-center justify-center"><Loader2 className="animate-spin" /></div> : <RevenueChart ledgerEntries={transactions} />}
                    </CardContent>
                </Card>
                <div className="space-y-8">
                    <UserManagementSummary />
                    <RecentTransactions transactions={transactions} users={users} loading={loading} />
                </div>
            </div>
        </>
    )
}
