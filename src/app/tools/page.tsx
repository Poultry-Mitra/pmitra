// src/app/tools/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart,
  Calculator,
  Droplet,
  Wrench,
} from 'lucide-react';
import { BroilerCalculator } from '@/app/_components/broiler-calculator';
import { FcrCalculator } from '@/app/_components/fcr-calculator';

export default function ToolsPage() {
  return (
    <div className="container py-12">
       <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <Wrench className="size-16 text-primary" />
            <h1 className="font-headline text-4xl font-bold leading-[1.1] sm:text-4xl md:text-6xl">
                Poultry Tools & Calculators
            </h1>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                A collection of free tools to help you make smarter decisions for your farm.
            </p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-12">
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Heart className="size-8 text-destructive" />
                    <div>
                        <CardTitle className="font-headline text-2xl">AI Health Diagnosis</CardTitle>
                        <CardDescription>Worried about a sick bird? Check symptoms for an AI-powered diagnosis.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <Image src="https://picsum.photos/seed/chick/600/400" alt="Sick chicken diagnosis" width={600} height={400} className="rounded-lg object-cover" data-ai-hint="sick chicken" />
            </CardContent>
            <CardFooter>
                <Button size="lg" className="w-full" asChild>
                    <Link href="/diagnose">Check Flock Health Now</Link>
                </Button>
            </CardFooter>
        </Card>
        
        <BroilerCalculator />
        <FcrCalculator />
        
      </div>
    </div>
  );
}
