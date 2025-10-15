
// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, IndianRupee, ShoppingBag, Loader2 } from "lucide-react";
import { PageHeader } from "@/app/admin/_components/page-header";
import { useUsers } from "@/hooks/use-users";
import { useLanguage } from "@/components/language-provider";
import { useOrders } from "@/hooks/use-orders";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "../_components/revenue-chart";
import { RecentUsers } from "./_components/recent-users";
import { RecentTransactions } from "./_components/recent-transactions";

function KpiCard({ title, value, change, changeColor, icon: Icon }: { title: string, value: string | number, change: string, changeColor: string, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs ${changeColor}`}>
                    {change}
                </p>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
    const { users, loading: usersLoading } = useUsers();
    const { t } = useLanguage();
    const { orders, loading: ordersLoading } = useOrders(); 

    const loading = usersLoading || ordersLoading;

    const kpiData = useMemo(() => {
        if (loading) return null;
        
        // Calculate total revenue from completed orders
        const totalRevenue = orders.filter(o => o.status === 'Completed' || o.status === 'Approved').reduce((acc, order) => acc + order.totalAmount, 0);
        
        return {
            totalUsers: users.length,
            totalRevenue: totalRevenue,
            activeOrders: orders.filter(o => o.status === 'Pending').length,
        };
    }, [users, orders, loading]);

    return (
        <>
            <PageHeader title={t('admin.dashboard.title')} description={t('admin.dashboard.description')} />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {loading || !kpiData ? (
                   [...Array(3)].map((_, i) => (
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
                        />
                        <KpiCard 
                            title="Active Orders" 
                            value={kpiData.activeOrders} 
                            change="Pending Approval"
                            changeColor="text-muted-foreground"
                            icon={ShoppingBag}
                        />
                        <KpiCard 
                            title={t('admin.dashboard.kpi_total_revenue')}
                            value={`₹${kpiData.totalRevenue.toLocaleString()}`} 
                            change={t('admin.dashboard.kpi_total_revenue_change')}
                            changeColor="text-green-500" 
                            icon={IndianRupee}
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
                        {loading ? <div className="flex h-[300px] w-full items-center justify-center"><Loader2 className="animate-spin" /></div> : <RevenueChart orders={orders} />}
                    </CardContent>
                </Card>
                <div className="space-y-8">
                    <RecentUsers users={users} loading={usersLoading} />
                    <RecentTransactions orders={orders} loading={ordersLoading} />
                </div>
            </div>
        </>
    )
}
