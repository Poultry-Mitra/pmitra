
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { forecastPotentialProblems } from '@/ai/flows/forecast-potential-problems';
import { WandSparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';

const ForecastPotentialProblemsInputSchema = z.object({
  sensorData: z.string(),
  historicalData: z.string(),
});
type ForecastPotentialProblemsInput = z.infer<typeof ForecastPotentialProblemsInputSchema>;

export function AIForecast({ sensorData, historicalData }: ForecastPotentialProblemsInput) {
    const [loading, setLoading] = useState(false);
    const [forecast, setForecast] = useState<string | null>(null);

    const handleGetForecast = async () => {
        setLoading(true);
        setForecast(null);
        try {
            const result = await forecastPotentialProblems({ sensorData, historicalData });
            setForecast(result.forecast);
        } catch (error) {
            console.error("Failed to get AI forecast", error);
            setForecast("Sorry, I couldn't generate a forecast at this time. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={handleGetForecast} disabled={loading}>
                <WandSparkles className="mr-2" />
                {loading ? 'Generating Forecast...' : 'Forecast Potential Problems'}
            </Button>
            
            {loading && (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            )}
            
            {forecast && (
                 <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap rounded-md border bg-secondary/50 p-4">
                    <h4 className="font-headline text-foreground">AI Forecast</h4>
                    <p>{forecast}</p>
                 </div>
            )}

            {!forecast && !loading && (
                 <div className="text-center text-sm text-muted-foreground p-4">
                    Click the button to generate an AI-powered forecast based on current and historical farm data.
                 </div>
            )}
        </div>
    );
}
