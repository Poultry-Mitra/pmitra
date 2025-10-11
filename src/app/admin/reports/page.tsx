
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<string>('');

    const handleGenerateReport = () => {
        if (!reportType) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000); // Simulate report generation
    };

    return (
        <>
            <PageHeader title="Reports & Analytics" description="Generate and download reports for users, revenue, and system usage." />
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate a New Report</CardTitle>
                        <CardDescription>Select the report type and date range to generate a downloadable report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Report Type</label>
                                <Select onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a report type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user_growth">User Growth Report</SelectItem>
                                        <SelectItem value="revenue">Revenue Report</SelectItem>
                                        <SelectItem value="ai_usage">AI Chat Usage Report</SelectItem>
                                        <SelectItem value="farm_analytics">Farm Analytics Summary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date Range</label>
                                <DatePickerWithRange />
                            </div>
                            <Button onClick={handleGenerateReport} disabled={loading || !reportType}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2" />}
                                {loading ? "Generating..." : "Generate & Download"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

// You might need to create this component if it doesn't exist.
// This is a placeholder for a date range picker component.
// You can use the one from `shadcn/ui` examples.
const DatePickerWithRange = () => {
    return <Input placeholder="Select date range" className="w-full md:w-80" />;
}
