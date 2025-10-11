
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockFarmMetrics } from "@/lib/data";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import { ProductionChart } from "./_components/production-chart";
import { AISuggestions } from "./_components/ai-suggestions";

export default function DashboardPage() {
  const latestMetrics = mockFarmMetrics[mockFarmMetrics.length - 1];

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your farm's performance.">
        <Button variant="outline">
          <FileDown className="mr-2" />
          Export Data
        </Button>
        <Button>
            <Plus className="mr-2"/>
            Add New Coop
        </Button>
      </PageHeader>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Egg Production Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.productionRate}%</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.mortalityRate}%</div>
            <p className="text-xs text-muted-foreground">-0.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Feed Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.feedConsumption} g/bird</div>
            <p className="text-xs text-muted-foreground">+2g from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,450</div>
            <p className="text-xs text-muted-foreground">in 4 active coops</p>
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
