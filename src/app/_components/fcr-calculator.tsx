// src/app/_components/fcr-calculator.tsx
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Droplet, HelpCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function FcrCalculator() {
  const [weightGain, setWeightGain] = useState('');
  const [feedConsumed, setFeedConsumed] = useState('');
  const [fcr, setFcr] = useState<number | null>(null);

  const calculateFcr = () => {
    const wg = parseFloat(weightGain);
    const fc = parseFloat(feedConsumed);

    if (wg > 0 && fc > 0) {
      setFcr(fc / wg);
    } else {
      setFcr(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Droplet className="size-8 text-primary" />
            <div>
                <CardTitle className="font-headline text-2xl">FCR Calculator</CardTitle>
                <CardDescription>Calculate your Feed Conversion Ratio.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="weightGain" className="flex items-center gap-1">
            Total Weight Gain (in kg)
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="size-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>The total live weight of all birds sold.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="weightGain"
            type="number"
            value={weightGain}
            onChange={(e) => setWeightGain(e.target.value)}
            placeholder="e.g., 2000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedConsumed">Total Feed Consumed (in kg)</Label>
          <Input
            id="feedConsumed"
            type="number"
            value={feedConsumed}
            onChange={(e) => setFeedConsumed(e.target.value)}
            placeholder="e.g., 3800"
          />
        </div>

        <Button onClick={calculateFcr} className="w-full">
            Calculate FCR
        </Button>
      </CardContent>
       {fcr !== null && (
        <CardContent>
             <Alert className="border-primary bg-primary/10">
                <AlertDescription className="text-center">
                    <p className="text-sm text-primary">Your Feed Conversion Ratio is:</p>
                    <p className="text-3xl font-bold text-primary">{fcr.toFixed(2)}</p>
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}
