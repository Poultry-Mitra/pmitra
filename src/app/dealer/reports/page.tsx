
"use client";

import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FileDown, Loader2, Calendar as CalendarIcon, Eye } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: new Date(),
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal md:w-[300px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}


export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<string>('');
    const [reportData, setReportData] = useState<any | null>(null);

    const handleViewReport = () => {
        if (!reportType) return;
        setLoading(true);
        setReportData(null);
        setTimeout(() => {
            // Simulate fetching report data
            setReportData({
                title: `${reportType.replace(/_/g, ' ')} Report`,
                rows: [
                    { month: 'January', users: 150, revenue: '₹30,000' },
                    { month: 'February', users: 210, revenue: '₹45,000' },
                    { month: 'March', users: 280, revenue: '₹60,000' },
                ]
            });
            setLoading(false);
        }, 1500);
    };

    const handleDownloadReport = () => {
        alert("Downloading report...");
    }

    const handleRowClick = (row: any) => {
        alert(`Viewing details for ${row.month}`);
    }

    return (
        <>
            <PageHeader title="Reports & Analytics" description="Generate and download reports for users, revenue, and system usage." />
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate a New Report</CardTitle>
                        <CardDescription>Select the report type and date range to generate a report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Report Type</label>
                                <Select onValueChange={(value) => { setReportType(value); setReportData(null); }}>
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
                            <Button onClick={handleViewReport} disabled={loading || !reportType}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2" />}
                                {loading ? "Generating..." : "View Report"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {reportData && (
                    <Card className="mt-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{reportData.title}</CardTitle>
                                <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                            </div>
                            <Button variant="outline" onClick={handleDownloadReport}>
                                <FileDown className="mr-2"/>
                                Download Report
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>New Users</TableHead>
                                        <TableHead>Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.rows.map((row: any) => (
                                        <TableRow key={row.month} onClick={() => handleRowClick(row)} className="cursor-pointer">
                                            <TableCell>{row.month}</TableCell>
                                            <TableCell>{row.users}</TableCell>
                                            <TableCell>{row.revenue}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
