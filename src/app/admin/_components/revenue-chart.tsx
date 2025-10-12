
"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
    revenue: {
        label: "Revenue (INR)",
        color: "hsl(var(--chart-1))",
    },
    revenueLastMonth: {
        label: "Revenue (Last Month)",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function RevenueChart({ data = [] }: { data?: any[] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
                Not enough data to display chart.
            </div>
        )
    }

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                     <YAxis 
                        tickFormatter={(value) => `₹${value / 1000}k`}
                     />
                    <Tooltip content={<ChartTooltipContent 
                        formatter={(value) => {
                            if (typeof value === 'number') {
                                return `₹${value.toLocaleString()}`;
                            }
                            return value;
                        }}
                    />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={true} />
                    <Line type="monotone" dataKey="revenueLastMonth" stroke="var(--color-revenueLastMonth)" strokeWidth={2} strokeDasharray="5 5" dot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
