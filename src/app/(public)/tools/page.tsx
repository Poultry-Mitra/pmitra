// src/app/(public)/tools/page.tsx
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
  Egg,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { PageHeader } from '@/app/(public)/_components/page-header';
import { useAppUser } from '@/app/app-provider';

export default function ToolsPage() {
  const { user } = useAppUser();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mt-12">
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
                <Egg className="size-8 text-primary" />
                <CardTitle className="font-headline text-xl pt-2">Layer Feed Consumption</CardTitle>
                <CardDescription>Estimate total feed required for your layer birds over a period.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Calculate total feed for growing phase.</li>
                    <li>Estimate feed for the entire laying period.</li>
                    <li>Plan your purchases in advance.</li>
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
                    <li>Input daily feed intake and cost.</li>
                    <li>Factor in your flock's production percentage.</li>
                    <li>Find out the exact feed cost per egg.</li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/tools/per-egg-cost">Use Tool</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>

       <div className="mt-12 flex flex-wrap justify-center gap-4">
            {user && (
                <Button asChild>
                    <Link href="/dashboard"><LayoutDashboard className="mr-2" /> Go to Dashboard</Link>
                </Button>
            )}
            <Button variant="outline" asChild>
                <Link href="/"><ArrowLeft className="mr-2" /> Go back to Homepage</Link>
            </Button>
        </div>
    </div>
  );
}
