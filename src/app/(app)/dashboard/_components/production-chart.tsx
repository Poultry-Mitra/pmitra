
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FarmMetric } from '@/lib/types';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
    productionRate: {
        label: "Production (%)",
        color: "hsl(var(--chart-1))",
    },
    mortalityRate: {
        label: "Mortality (%)",
        color: "hsl(var(--destructive))",
    },
    feedConsumption: {
        label: "Feed (g)",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function ProductionChart({ data }: { data: FarmMetric[] }) {
    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                     <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="productionRate" fill="var(--color-productionRate)" radius={4} />
                    <Bar dataKey="feedConsumption" fill="var(--color-feedConsumption)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
