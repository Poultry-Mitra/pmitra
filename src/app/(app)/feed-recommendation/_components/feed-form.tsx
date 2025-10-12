
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendOptimalFeed, type RecommendOptimalFeedOutput } from '@/ai/flows/recommend-optimal-feed';
import { WandSparkles, Loader2 } from 'lucide-react';
import { mockFarmMetrics } from '@/lib/data';

const formSchema = z.object({
  productionRate: z.coerce.number().min(0, "Must be non-negative").max(100, "Cannot exceed 100"),
  mortalityRate: z.coerce.number().min(0, "Must be non-negative").max(100, "Cannot exceed 100"),
  feedConsumption: z.coerce.number().min(0, "Must be non-negative"),
  chickenAgeWeeks: z.coerce.number().int().min(0, "Must be a non-negative integer"),
  environmentalConditions: z.string().min(10, "Please provide a brief description."),
});

type FormValues = z.infer<typeof formSchema>;

export function FeedRecommendationForm() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendOptimalFeedOutput | null>(null);
  const latestMetrics = mockFarmMetrics[mockFarmMetrics.length - 1];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productionRate: latestMetrics.productionRate,
      mortalityRate: latestMetrics.mortalityRate,
      feedConsumption: latestMetrics.feedConsumption,
      chickenAgeWeeks: 24,
      environmentalConditions: "Temperate climate, controlled indoor environment with automated lighting.",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setRecommendation(null);
    try {
      const result = await recommendOptimalFeed(values);
      setRecommendation(result);
    } catch (error) {
      console.error("Failed to get feed recommendation:", error);
      // Handle error display
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Farm Data Input</CardTitle>
                <CardDescription>Default values are based on your latest metrics.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                        control={form.control}
                        name="productionRate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Production Rate (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 92" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="mortalityRate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Mortality Rate (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 0.8" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="feedConsumption"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Feed Consumption (g/day)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 120" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="chickenAgeWeeks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Average Chicken Age (weeks)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 24" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                    control={form.control}
                    name="environmentalConditions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Environmental Conditions</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe temperature, humidity, lighting, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                    {loading ? 'Analyzing...' : 'Get AI Recommendation'}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
                <CardDescription>Our AI will provide a feed recommendation based on your data.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                {recommendation ? (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-headline font-semibold text-foreground">Recommendation</h3>
                            <p className="text-muted-foreground">{recommendation.recommendation}</p>
                        </div>
                        <div>
                            <h3 className="font-headline font-semibold text-foreground">Reasoning</h3>
                            <p className="text-muted-foreground">{recommendation.reasoning}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <WandSparkles className="mx-auto h-12 w-12" />
                        <p className="mt-4">Your recommendation will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
