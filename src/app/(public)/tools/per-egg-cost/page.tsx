// src/app/(public)/tools/per-egg-cost/page.tsx
"use client";

import { useReducer, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Egg, RefreshCw } from 'lucide-react';
import { ToolPageLayout } from '../_components/tool-page-layout';

const initialState = {
  feedIntake: '115',
  feedCost: '40',
  productionPercentage: '90',
};

function reducer(state: typeof initialState, action: { type: string, payload?: any }) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function PerEggCostPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const result = useMemo(() => {
    const feedIntake = parseFloat(state.feedIntake);
    const feedCost = parseFloat(state.feedCost);
    const productionPercentage = parseFloat(state.productionPercentage);

    if (feedIntake > 0 && feedCost > 0 && productionPercentage > 0) {
      const perEggFeedCost = ((feedIntake / 1000) * feedCost) / (productionPercentage / 100);
      return perEggFeedCost.toFixed(2);
    }
    return null;
  }, [state]);

  const handleReset = () => dispatch({ type: 'RESET' });

  return (
    <ToolPageLayout
      title="Per Egg Feed Cost Calculator"
      description="Calculate the feed cost to produce a single egg."
    >
      <Card>
        <CardHeader>
          <CardTitle>Production Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedIntake">Per Bird Feed Intake (Gram)</Label>
            <Input id="feedIntake" type="number" value={state.feedIntake} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'feedIntake', value: e.target.value } })} min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedCost">Feed Cost (per Kg)</Label>
            <Input id="feedCost" type="number" value={state.feedCost} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'feedCost', value: e.target.value } })} min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productionPercentage">Production Percentage</Label>
            <Input id="productionPercentage" type="number" value={state.productionPercentage} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'productionPercentage', value: e.target.value } })} min="0" max="100" />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          {result !== null && (
            <Alert className="w-full border-primary bg-primary/10 animate-in fade-in-50">
              <Egg className="h-4 w-4 !text-primary" />
              <AlertTitle>Result</AlertTitle>
              <AlertDescription className="text-center">
                <p className="text-sm text-primary">Your Feed Cost Per Egg is:</p>
                <p className="text-3xl font-bold text-primary">₹{result}</p>
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleReset} className="w-full" variant="outline">
            <RefreshCw className="mr-2"/>
            Reset
          </Button>
        </CardFooter>
      </Card>
    </ToolPageLayout>
  );
}