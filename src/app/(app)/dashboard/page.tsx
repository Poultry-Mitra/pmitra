
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockFarmMetrics, currentUser } from "@/lib/data";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { FileDown, Plus, Copy, Zap } from "lucide-react";
import { ProductionChart } from "./_components/production-chart";
import { AISuggestions } from "./_components/ai-suggestions";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const latestMetrics = mockFarmMetrics[mockFarmMetrics.length - 1];
  const user = currentUser;
  const poultryMitraId = `PM-FARM-${user.id.substring(0, 5).toUpperCase()}`;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{poultryMitraId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Copy className="size-3" />
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Badge>Premium Plan</Badge>
             <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                <Zap className="mr-2" />
                Upgrade Plan
            </Button>
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Active Coops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">10,450 Birds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Connected Dealers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 Active Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Chats Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Unlimited</div>
            <p className="text-xs text-muted-foreground">Premium Access</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Farm Performance Overview</CardTitle>
            <CardDescription>Monthly trends for key farm metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionChart data={mockFarmMetrics} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>AI-Powered Suggestions</CardTitle>
            <CardDescription>Get suggestions to improve farm efficiency.</CardDescription>
          </CardHeader>
          <CardContent>
            <AISuggestions farmData={{
              productionRate: latestMetrics.productionRate,
              mortalityRate: latestMetrics.mortalityRate,
              feedConsumption: latestMetrics.feedConsumption,
              farmSize: 10450
            }} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
