// src/app/(public)/tools/fcr-calculator/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Droplet, HelpCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from '@/lib/utils';
import { PageHeader } from '@/app/(public)/_components/page-header';

export default function FcrCalculatorPage() {
  const [weightGain, setWeightGain] = useState('');
  const [feedInput, setFeedInput] = useState('');
  const [feedUnit, setFeedUnit] = useState<'kg' | 'bags'>('kg');
  const [fcr, setFcr] = useState<number | null>(null);

  const calculateFcr = () => {
    const wg = parseFloat(weightGain);
    const fi = parseFloat(feedInput);

    if (wg > 0 && fi > 0) {
      const totalFeedInKg = feedUnit === 'bags' ? fi * 50 : fi;
      setFcr(totalFeedInKg / wg);
    } else {
      setFcr(null);
    }
  };

  return (
    <div className="container py-12">
        <PageHeader 
            title="FCR Calculator"
            description="Calculate your Feed Conversion Ratio to measure efficiency."
        />
        <div className="mt-8 max-w-md mx-auto">
            <Alert variant="destructive" className="mb-6 bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>चेतावनी (Warning)</AlertTitle>
                <AlertDescription>
                    यह केवल एक अनुमान है और 100% सटीक नहीं हो सकता है। कृपया अपने निर्णय के लिए पेशेवर सलाह भी लें।
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>Enter Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <Label htmlFor="feedConsumed">Total Feed Consumed</Label>
                        <div className="flex gap-2">
                            <Input
                                id="feedConsumed"
                                type="number"
                                value={feedInput}
                                onChange={(e) => setFeedInput(e.target.value)}
                                placeholder={feedUnit === 'kg' ? "e.g., 3800" : "e.g., 76"}
                            />
                            <ToggleGroup 
                                type="single" 
                                value={feedUnit} 
                                onValueChange={(value: 'kg' | 'bags') => {
                                    if (value) setFeedUnit(value)
                                }}
                                className="gap-1"
                            >
                                <ToggleGroupItem value="kg" aria-label="Kilograms" className="h-10 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    KG
                                </ToggleGroupItem>
                                <ToggleGroupItem value="bags" aria-label="Bags" className="h-10 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    Bags
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
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
        </div>
    </div>
  );
}
