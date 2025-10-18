// src/app/(public)/tools/per-egg-cost/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Egg, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/app/(public)/_components/page-header';

export default function PerEggCostPage() {
  const [inputs, setInputs] = useState({
    feedIntake: 115,
    feedCost: 40,
    productionPercentage: 90,
  });
  const [result, setResult] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: Number(value) }));
  };

  const calculateCost = () => {
    const { feedIntake, feedCost, productionPercentage } = inputs;
    if (feedIntake > 0 && feedCost > 0 && productionPercentage > 0) {
      const perEggFeedCost = ((feedIntake / 1000) * feedCost) / (productionPercentage / 100);
      setResult(perEggFeedCost);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="container py-12">
        <PageHeader 
            title="Per Egg Feed Cost Calculator"
            description="Calculate the feed cost to produce a single egg."
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
                    <CardTitle>Production Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedIntake">Per Bird Feed Intake (Gram)</Label>
                        <Input id="feedIntake" type="number" value={inputs.feedIntake} onChange={handleInputChange} min="0" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="feedCost">Feed Cost (per Kg)</Label>
                        <Input id="feedCost" type="number" value={inputs.feedCost} onChange={handleInputChange} min="0" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="productionPercentage">Production Percentage</Label>
                        <Input id="productionPercentage" type="number" value={inputs.productionPercentage} onChange={handleInputChange} min="0" max="100" />
                    </div>
                    <Button onClick={calculateCost} className="w-full">
                        <Egg className="mr-2" />
                        Calculate Cost
                    </Button>
                </CardContent>
            </Card>

            {result !== null && (
                <Alert className="mt-8 border-primary bg-primary/10 animate-in fade-in-50">
                    <Egg className="h-4 w-4 !text-primary" />
                    <AlertTitle>Result</AlertTitle>
                    <AlertDescription className="text-center">
                        <p className="text-sm text-primary">Your Feed Cost Per Egg is:</p>
                        <p className="text-3xl font-bold text-primary">₹{result.toFixed(2)}</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    </div>
  );
}
