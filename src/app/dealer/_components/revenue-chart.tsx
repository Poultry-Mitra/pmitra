// src/app/dealer/_components/revenue-chart.tsx
"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import type { Order } from '@/lib/types';

const chartConfig = {
    revenue: {
        label: "Revenue (INR)",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function RevenueChart({ orders }: { orders: Order[] }) {
    const revenueData = useMemo(() => {
        if (!orders) return [];

        const successfulOrders = orders.filter(o => o.status === 'Approved');
        
        const dailyRevenue: { [key: string]: number } = {};

        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
            dailyRevenue[date] = 0;
        }

        successfulOrders.forEach(order => {
            if (order.createdAt) {
                const date = format(startOfDay(new Date(order.createdAt)), 'yyyy-MM-dd');
                if (date in dailyRevenue) {
                    dailyRevenue[date] += order.totalAmount;
                }
            }
        });

        let cumulativeRevenue = 0;
        return Object.keys(dailyRevenue).sort().map(date => {
            cumulativeRevenue += dailyRevenue[date];
            return {
                date: format(new Date(date), 'MMM dd'),
                revenue: cumulativeRevenue,
            };
        });

    }, [orders]);


    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <AreaChart data={revenueData}>
                     <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0.1}
                        />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        fontSize={12}
                    />
                     <YAxis 
                        tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                     />
                    <Tooltip content={<ChartTooltipContent 
                        formatter={(value) => {
                            if (typeof value === 'number') {
                                return `₹${value.toLocaleString()}`;
                            }
                            return value;
                        }}
                    />} />
                    <Area 
                        dataKey="revenue" 
                        type="natural"
                        fill="url(#fillRevenue)"
                        stroke="var(--color-revenue)" 
                        stackId="a"
                        />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
