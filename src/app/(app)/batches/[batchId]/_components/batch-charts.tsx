// src/app/(app)/batches/[batchId]/_components/batch-charts.tsx
"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyRecord } from '@/lib/types';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const chartConfig = {
    mortality: {
        label: "Mortality",
        color: "hsl(var(--destructive))",
    },
    feedConsumed: {
        label: "Feed (kg)",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function BatchCharts({ data }: { data: DailyRecord[] }) {
    if (data.length === 0) return null;

    const formattedData = data.map(record => ({
        ...record,
        formattedDate: format(new Date(record.date), "dd MMM")
    }));

    return (
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <h4 className="text-sm font-medium text-center mb-4">Daily Mortality Trend</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={formattedData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                fontSize={12}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="mortality" stroke="var(--color-mortality)" strokeWidth={2} dot={true} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div>
                     <h4 className="text-sm font-medium text-center mb-4">Daily Feed Consumption (kg)</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={formattedData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                fontSize={12}
                            />
                             <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="feedConsumed" stroke="var(--color-feedConsumed)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </ChartContainer>
    );
}