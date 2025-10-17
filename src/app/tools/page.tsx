// src/app/tools/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart,
  Wrench,
  Calculator,
  Droplet,
  LineChart,
  GitCompareArrows,
  Egg,
  Bird,
} from 'lucide-react';

export default function ToolsPage() {
  return (
    <div className="container py-12">
       <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <Wrench className="size-16 text-primary" />
            <h1 className="font-headline text-4xl font-bold leading-[1.1] sm:text-4xl md:text-6xl">
                Poultry Tools & Calculators
            </h1>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Use our free calculators and AI tools to make smarter decisions for your farm.
            </p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start mt-12">
        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <Heart className="size-8 text-destructive" />
                <CardTitle className="font-headline text-xl pt-2">AI Health Diagnosis</CardTitle>
                <CardDescription>Worried about a sick bird? Get an AI-powered diagnosis.</CardDescription>
            </CardHeader>
             <CardContent className="flex-1">
                 <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Select symptoms from a comprehensive list.</li>
                    <li>Upload a photo for more accurate analysis.</li>
                    <li>Get instant, AI-powered disease possibilities.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/diagnose-health">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>
        
        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <Calculator className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">Broiler Farm Calculator</CardTitle>
                <CardDescription>Estimate costs and profits for a 45-day broiler cycle.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                 <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Calculate feed requirements.</li>
                    <li>Estimate total costs and potential profit.</li>
                    <li>Plan your equipment needs.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/broiler-calculator">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>

        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <Droplet className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">FCR Calculator</CardTitle>
                <CardDescription>Calculate your Feed Conversion Ratio to measure efficiency.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Input total feed and weight gain.</li>
                    <li>Get your FCR instantly.</li>
                    <li>Benchmark your performance.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/fcr-calculator">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>

        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <LineChart className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">Feed Comparison Calculator</CardTitle>
                <CardDescription>Compare feed brands by price and nutrition to find the best value.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Enter details for multiple feed brands.</li>
                    <li>Compare cost per kg and cost per kg of weight gain.</li>
                    <li>Make data-driven decisions.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/feed-comparison">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>

        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <GitCompareArrows className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">Broiler Feed Rate Comparison</CardTitle>
                <CardDescription>Compare the cost-effectiveness of two different broiler feeds.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Input consumption and rate for two feeds.</li>
                    <li>See total cost and potential savings.</li>
                    <li>Calculate cost per bag for each.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/broiler-feed-comparison">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>

        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <Bird className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">Layer Feed Consumption</CardTitle>
                <CardDescription>Estimate total feed required for your layer birds over a period.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Input total birds and number of weeks.</li>
                    <li>Get feed estimates for different growth phases.</li>
                    <li>Plan your feed procurement in advance.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/layer-feed-consumption">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>
        
        <Card className="h-full flex flex-col hover:border-primary transition-colors">
            <CardHeader>
                <Egg className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">Per Egg Feed Cost</CardTitle>
                <CardDescription>Calculate the feed cost to produce a single egg.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Based on feed intake and production percentage.</li>
                    <li>Understand your production efficiency.</li>
                    <li>Optimize feed for better profitability.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/per-egg-cost">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>

      </div>
    </div>
  );
}
