
import { PageHeader } from "@/app/(app)/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockFarmMetrics, mockUsers } from "@/lib/data";
import { Users, Bot, IndianRupee, BarChart } from "lucide-react";
import { UserManagementSummary } from "../_components/user-management-summary";
import { RevenueChart } from "../_components/revenue-chart";

const kpiData = [
    {
        title: "Total Farmers",
        value: "1,254",
        change: "+5.2%",
        icon: Users,
    },
    {
        title: "Total Dealers",
        value: "82",
        change: "+2.1%",
        icon: Users,
    },
    {
        title: "Monthly Revenue",
        value: "INR 85,420",
        change: "+15.8%",
        icon: IndianRupee,
    },
    {
        title: "AI Chats Today",
        value: "312",
        change: "-3.4%",
        icon: Bot,
    }
]

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
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className={`text-xs ${kpi.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                {kpi.change} from last month
                            </p>
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
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>AI Chat Overview</CardTitle>
                        <CardDescription>Performance of the AI assistant.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Live Chat Requests</p>
                                <p className="text-2xl font-bold">42</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                                <p className="text-2xl font-bold">2.1s</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="text-sm font-medium mb-2">Top 5 Common Queries</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex justify-between"><span>Feed type for winter?</span> <span>(45)</span></li>
                                <li className="flex justify-between"><span>Gumboro disease symptoms</span> <span>(32)</span></li>
                                <li className="flex justify-between"><span>Low egg production causes</span> <span>(28)</span></li>
                                <li className="flex justify-between"><span>How to increase weight?</span> <span>(19)</span></li>
                                <li className="flex justify-between"><span>Best poultry breed for meat</span> <span>(15)</span></li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
               <UserManagementSummary />
            </div>

        </>
    )
}
