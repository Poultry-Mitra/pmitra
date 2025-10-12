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


export default function AdminDashboardPage() {
    const { users, loading } = useUsers();

    // In a real app, revenue and AI chat usage would be fetched from analytics or a separate collection.
    // We'll keep these as static for now as the data sources don't exist.
    const totalRevenue = "₹95,500"; // MOCK DATA
    const aiChatsUsed = "1,204"; // MOCK DATA


    const adminKpiData = [
        {
            title: "Total Users",
            value: loading ? <Loader2 className="animate-spin" /> : users.length,
            change: "+2 this month",
            icon: Users,
        },
        {
            title: "Total Revenue",
            value: totalRevenue,
            change: "+15% from last month",
            icon: IndianRupee,
        },
        {
            title: "AI Chats Used",
            value: aiChatsUsed,
            change: "in last 30 days",
            icon: Bot,
        },
        {
            title: "Platform Activity",
            value: "High",
            change: "All systems normal",
            icon: Activity,
        },
    ];

    return (
        <>
            <PageHeader title="Admin Dashboard" description="Overview of the PoultryMitra ecosystem.">
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/notifications">
                            <Send className="mr-2" />
                            Send Notification
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/user-management/add-user">
                            <PlusCircle className="mr-2" />
                            Add User
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
             <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Monthly platform revenue (mock data).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>
                <div className="lg:col-span-1">
                    <UserManagementSummary />
                </div>
            </div>
        </>
    )
}
