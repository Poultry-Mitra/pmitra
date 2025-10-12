
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FarmMetric } from '@/lib/types';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useLanguage } from '@/components/language-provider';

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
    const { t } = useLanguage();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No performance data available yet.
            </div>
        );
    }

    const localizedData = data.map(item => ({
        ...item,
        month: new Date(2024, parseInt(item.month.split('-')[1]) - 1).toLocaleString(t('nav.home') === 'Home' ? 'en-US' : 'hi-IN', { month: 'short' })
    }));

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <BarChart data={localizedData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
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
