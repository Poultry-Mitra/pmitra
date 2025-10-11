

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockFarmMetrics, mockUsers } from "@/lib/data";
import { Users, Bot, IndianRupee, Activity, WifiOff, Server } from "lucide-react";
import { UserManagementSummary } from "../_components/user-management-summary";
import { RevenueChart } from "../_components/revenue-chart";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from "@/app/admin/_components/page-header";

const kpiData = [
    {
        title: "Total Farmers",
        value: "1,254",
        change: "+5.2%",
        changeColor: "text-green-500",
        icon: Users,
        chartData: [{ value: 4 }, { value: 3 }, { value: 5 }, { value: 6 }, { value: 8 }, { value: 7 }],
        chartColor: "hsl(var(--chart-1))"
    },
    {
        title: "Total Dealers",
        value: "82",
        change: "+2.1%",
        changeColor: "text-green-500",
        icon: Users,
        chartData: [{ value: 2 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 5 }, { value: 4 }],
        chartColor: "hsl(var(--chart-1))"
    },
    {
        title: "Monthly Revenue",
        value: "₹85,420",
        change: "+15.8%",
        changeColor: "text-green-500",
        icon: IndianRupee,
        chartData: [{ value: 10 }, { value: 12 }, { value: 15 }, { value: 14 }, { value: 18 }, { value: 20 }],
        chartColor: "hsl(var(--chart-1))"
    },
    {
        title: "AI Chats Today",
        value: "312",
        change: "-3.4%",
        changeColor: "text-red-500",
        icon: Bot,
        chartData: [{ value: 80 }, { value: 90 }, { value: 75 }, { value: 100 }, { value: 110 }, { value: 95 }],
        chartColor: "hsl(var(--chart-2))"
    }
];

function Sparkline({ data, color }: { data: { value: number }[], color: string }) {
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

export default function AdminDashboardPage() {
    return (
        <>
            <PageHeader title="Admin Dashboard" description="Overview of the PoultryMitra ecosystem." />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiData.map(kpi => (
                    <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    <p className={`text-xs ${kpi.changeColor}`}>
                                        {kpi.change} from last month
                                    </p>
                                </div>
                                <Sparkline data={kpi.chartData} color={kpi.chartColor} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Monthly revenue from subscriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={mockFarmMetrics} />
                    </CardContent>
                </Card>
                 <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Chat Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Live Requests</p>
                                    <p className="text-2xl font-bold">42</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Response</p>
                                    <p className="text-2xl font-bold">2.1s</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-2">Top Queries Today</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li className="flex justify-between"><span>Feed for winter?</span> <span>(45)</span></li>
                                    <li className="flex justify-between"><span>Gumboro disease</span> <span>(32)</span></li>
                                    <li className="flex justify-between"><span>Low egg production</span> <span>(28)</span></li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-around">
                            <div className="flex flex-col items-center gap-2">
                                <Server className="text-green-500" />
                                <Badge variant="outline" className="border-green-500 text-green-500">Firestore</Badge>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Activity className="text-green-500" />
                                <Badge variant="outline" className="border-green-500 text-green-500">API</Badge>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <WifiOff className="text-red-500" />
                                <Badge variant="destructive">Hosting</Badge>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
            
            <div className="mt-8">
               <UserManagementSummary />
            </div>

        </>
    )
}
