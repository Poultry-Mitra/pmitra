
"use client";

import { useState, useEffect } from 'react';
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
import { useBatches } from '@/hooks/use-batches';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppUser } from '@/app/app-provider';

const formSchema = z.object({
  productionRate: z.coerce.number().min(0, "Must be non-negative"),
  mortalityRate: z.coerce.number().min(0, "Must be non-negative").max(100, "Cannot exceed 100"),
  feedConsumption: z.coerce.number().min(0, "Must be non-negative"),
  chickenAgeWeeks: z.coerce.number().int().min(0, "Must be a non-negative integer"),
  environmentalConditions: z.string().min(10, "Please provide a brief description."),
});

type FormValues = z.infer<typeof formSchema>;

export function FeedRecommendationForm() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendOptimalFeedOutput | null>(null);
  const { user, loading: appUserLoading } = useAppUser();
  const { batches, loading: batchesLoading } = useBatches(user?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productionRate: 0,
      mortalityRate: 0,
      feedConsumption: 0,
      chickenAgeWeeks: 0,
      environmentalConditions: "Temperate climate, controlled indoor environment with automated lighting.",
    },
  });

  useEffect(() => {
    if (!batchesLoading && batches && batches.length > 0) {
        const activeBatches = batches.filter(b => b.status === 'Active');
        if (activeBatches.length > 0) {
            const totalChicks = activeBatches.reduce((sum, b) => sum + b.totalChicks, 0);
            const totalMortality = activeBatches.reduce((sum, b) => sum + b.mortalityCount, 0);
            const totalFeedConsumed = activeBatches.reduce((sum, b) => sum + b.feedConsumed, 0);
            const liveBirds = totalChicks - totalMortality;

            const avgMortalityRate = totalChicks > 0 ? (totalMortality / totalChicks) * 100 : 0;
            
            const totalDays = activeBatches.reduce((sum, b) => {
                 const ageInMs = new Date().getTime() - new Date(b.batchStartDate).getTime();
                 return sum + Math.floor(ageInMs / (1000 * 60 * 60 * 24));
            }, 0);
            const avgDays = totalDays / activeBatches.length;
            
            const avgFeedPerBirdPerDay = (liveBirds > 0 && avgDays > 0) ? (totalFeedConsumed / liveBirds / avgDays) * 1000 : 0; // in grams

            const avgAgeWeeks = Math.floor(avgDays / 7);

            form.reset({
                ...form.getValues(),
                productionRate: activeBatches.some(b => b.batchType === 'Layer') ? 85 : 0, // Placeholder for layers
                mortalityRate: parseFloat(avgMortalityRate.toFixed(2)),
                feedConsumption: parseFloat(avgFeedPerBirdPerDay.toFixed(2)),
                chickenAgeWeeks: avgAgeWeeks,
            });
        }
    }
  }, [batches, batchesLoading, form]);


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

  if (appUserLoading || batchesLoading) {
      return (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Card>
                  <CardHeader>
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </CardContent>
              </Card>
              <Card className="flex flex-col">
                 <CardHeader>
                     <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <WandSparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                </CardContent>
              </Card>
          </div>
      )
  }
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Farm Data Input</CardTitle>
                <CardDescription>Default values are based on your latest active batch metrics.</CardDescription>
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
                             <FormDescription className="text-xs">For layer batches. Keep 0 for broilers.</FormDescription>
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
                                <Input type="number" step="0.01" placeholder="e.g., 0.8" {...field} />
                            </FormControl>
                             <FormDescription className="text-xs">Overall mortality of active batches.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="feedConsumption"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Avg. Feed/Bird (g/day)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 120" {...field} />
                            </FormControl>
                             <FormDescription className="text-xs">Avg. daily feed per live bird.</FormDescription>
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
                                <Input type="number" placeholder="e.g., 4" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">Avg. age of active batches.</FormDescription>
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
