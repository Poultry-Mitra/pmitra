// src/app/(public)/tools/fcr-calculator/page.tsx
"use client";

import { useReducer, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HelpCircle, RefreshCw, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToolPageLayout } from '../_components/tool-page-layout';

const initialState = {
  weightGain: '',
  feedInput: '',
  feedUnit: 'kg' as 'kg' | 'bags',
};

function reducer(state: typeof initialState, action: { type: string, payload?: any }) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'SET_UNIT':
      return { ...state, feedUnit: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function FcrCalculatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fcr = useMemo(() => {
    const wg = parseFloat(state.weightGain);
    const fi = parseFloat(state.feedInput);

    if (wg > 0 && fi > 0) {
      const totalFeedInKg = state.feedUnit === 'bags' ? fi * 50 : fi;
      return (totalFeedInKg / wg).toFixed(2);
    }
    return null;
  }, [state]);

  const handleReset = () => dispatch({ type: 'RESET' });
  const handleCalculate = () => { /* The calculation is now reactive via useMemo */ };

  return (
    <ToolPageLayout
      title="FCR Calculator"
      description="Calculate your Feed Conversion Ratio to measure efficiency."
    >
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
              id="weightGain" type="number"
              value={state.weightGain}
              onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'weightGain', value: e.target.value } })}
              placeholder="e.g., 2000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedConsumed">Total Feed Consumed</Label>
            <div className="flex gap-2">
              <Input
                id="feedConsumed" type="number"
                value={state.feedInput}
                onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'feedInput', value: e.target.value } })}
                placeholder={state.feedUnit === 'kg' ? "e.g., 3800" : "e.g., 76"}
              />
              <ToggleGroup
                type="single"
                value={state.feedUnit}
                onValueChange={(value: 'kg' | 'bags') => value && dispatch({ type: 'SET_UNIT', payload: value })}
                className="gap-1"
              >
                <ToggleGroupItem value="kg" aria-label="Kilograms" className="h-10 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">KG</ToggleGroupItem>
                <ToggleGroupItem value="bags" aria-label="Bags" className="h-10 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Bags</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          {fcr !== null && (
            <Alert className="border-primary bg-primary/10 animate-in fade-in-50">
              <AlertDescription className="text-center">
                <p className="text-sm text-primary">Your Feed Conversion Ratio is:</p>
                <p className="text-3xl font-bold text-primary">{fcr}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleReset} className="w-full" variant="outline">
                <RefreshCw className="mr-2"/>
                Reset
            </Button>
        </CardFooter>
      </Card>
    </ToolPageLayout>
  );
}