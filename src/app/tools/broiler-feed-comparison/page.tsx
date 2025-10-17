
// src/app/tools/broiler-feed-comparison/page.tsx
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { GitCompareArrows } from 'lucide-react';
import { PageHeader } from '@/app/(app)/_components/page-header';

export default function BroilerFeedComparisonPage() {
  const [inputs, setInputs] = useState({
    feedConsumed1: 100,
    feedRate1: 45,
    feedConsumed2: 100,
    feedRate2: 48,
  });
  const [results, setResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: Number(value) }));
  };
  
  const calculate = () => {
    const { feedConsumed1, feedRate1, feedConsumed2, feedRate2 } = inputs;
    if (feedConsumed1 > 0 && feedRate1 > 0 && feedConsumed2 > 0 && feedRate2 > 0) {
      const feedCost1 = feedRate1 * feedConsumed1;
      const feedCost2 = feedRate2 * feedConsumed2;
      const saving = feedCost2 - feedCost1;
      // Assuming a 50kg bag for "per bag" calculation, similar to the original logic
      const perBagCost1 = (feedRate1 * 50);
      const perBagCost2 = (feedRate2 * 50);
      const cheaperBy = perBagCost2 - perBagCost1;

      setResults({
        feedCost1,
        feedCost2,
        saving,
        perBagCost1,
        perBagCost2,
        cheaperBy
      });
    } else {
      setResults(null);
    }
  };

  return (
    <div className="container py-12">
        <PageHeader 
            title="Broiler Feed Rate Comparison"
            description="Compare the cost-effectiveness of two different broiler feeds."
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Feed 1 (e.g., Skylark)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedConsumed1">Feed Consumed (in Kg)</Label>
                        <Input id="feedConsumed1" type="number" value={inputs.feedConsumed1} onChange={handleInputChange} min="0" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="feedRate1">Feed Rate (per Kg)</Label>
                        <Input id="feedRate1" type="number" value={inputs.feedRate1} onChange={handleInputChange} min="0" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Feed 2 (e.g., Other Brand)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedConsumed2">Feed Consumed (in Kg)</Label>
                        <Input id="feedConsumed2" type="number" value={inputs.feedConsumed2} onChange={handleInputChange} min="0" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="feedRate2">Feed Rate (per Kg)</Label>
                        <Input id="feedRate2" type="number" value={inputs.feedRate2} onChange={handleInputChange} min="0" />
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="mt-8 flex justify-center">
            <Button onClick={calculate} size="lg">
                <GitCompareArrows className="mr-2" />
                Compare Feeds
            </Button>
        </div>
        {results && (
            <Card className="mt-8 animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>Comparison Results</CardTitle>
                    <CardDescription>An analysis of the two feeds based on your inputs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead className="text-right">Feed 1</TableHead>
                                <TableHead className="text-right">Feed 2</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Total Feed Cost</TableCell>
                                <TableCell className="text-right">₹{results.feedCost1.toFixed(2)}</TableCell>
                                <TableCell className="text-right">₹{results.feedCost2.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Cost per 50kg Bag</TableCell>
                                <TableCell className="text-right">₹{results.perBagCost1.toFixed(2)}</TableCell>
                                <TableCell className="text-right">₹{results.perBagCost2.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <Separator />
                    <Alert variant={results.saving > 0 ? "default" : "destructive"} className={results.saving > 0 ? "bg-green-500/10 border-green-500/50 text-green-700" : ""}>
                        <AlertTitle>Total Savings with Feed 1</AlertTitle>
                        <AlertDescription className="text-2xl font-bold">
                            ₹{results.saving.toFixed(2)}
                        </AlertDescription>
                    </Alert>
                    <Alert variant={results.cheaperBy > 0 ? "default" : "destructive"} className={results.cheaperBy > 0 ? "bg-green-500/10 border-green-500/50 text-green-700" : ""}>
                        <AlertTitle>Feed 1 is Cheaper per Bag by</AlertTitle>
                        <AlertDescription className="text-2xl font-bold">
                            ₹{results.cheaperBy.toFixed(2)}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )}
    </div>
  )
}
