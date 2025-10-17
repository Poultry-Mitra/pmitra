// src/app/tools/layer-feed-consumption/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Bird } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function LayerFeedConsumptionPage() {
  const [inputs, setInputs] = useState({
    totalBirds: 1000,
    weeks: 72,
  });
  const [results, setResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: Number(value) }));
  };

  const calculateFeed = () => {
    const { totalBirds, weeks } = inputs;
    if (totalBirds > 0 && weeks > 0) {
      const chickCrumb = Math.round((((totalBirds*8)+(totalBirds*13)+(totalBirds*20)+(totalBirds*26)+(totalBirds*31))*7/1000/50));
      const grower = Math.round((((totalBirds*35)+(totalBirds*39)+(totalBirds*43)+(totalBirds*46)+(totalBirds*49))*7/1000/50));
      const developer = Math.round((((totalBirds*52)+(totalBirds*55)+(totalBirds*58)+(totalBirds*60)+(totalBirds*64))*7/1000/50));
      const preLayer = Math.round((((totalBirds*66)+(totalBirds*73)+(totalBirds*75))*7/1000/50));
      const growingPhase = Math.round(chickCrumb + grower + developer + preLayer);
      const layingPhase = weeks > 18 ? Math.round(((totalBirds*(weeks-18)*115)*7/1000/50)) : 0;
      const totalFeed = Math.round(growingPhase + layingPhase);

      setResults({
        chickCrumb,
        grower,
        developer,
        preLayer,
        growingPhase,
        layingPhase,
        totalFeed
      });
    } else {
      setResults(null);
    }
  };

  return (
    <div className="container py-12">
        <PageHeader 
            title="Layer Feed Consumption Calculator"
            description="Estimate total feed required for your layer birds over a period."
        />
        <div className="mt-8 max-w-lg mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Input Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="totalBirds">Total Birds</Label>
                        <Input id="totalBirds" type="number" value={inputs.totalBirds} onChange={handleInputChange} min="1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weeks">Total Weeks</Label>
                        <Input id="weeks" type="number" value={inputs.weeks} onChange={handleInputChange} min="1" />
                    </div>
                    <Button onClick={calculateFeed} className="w-full">
                        <Bird className="mr-2" />
                        Calculate Feed
                    </Button>
                </CardContent>
            </Card>

            {results && (
                <Card className="mt-8 animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Estimated Feed Requirement</CardTitle>
                        <CardDescription>All values are in number of 50kg bags.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Growing Phase (0-18 Weeks)</h4>
                            <Table>
                                <TableBody>
                                    <TableRow><TableCell>Chick Crumb</TableCell><TableCell className="text-right font-medium">{results.chickCrumb} Bags</TableCell></TableRow>
                                    <TableRow><TableCell>Grower</TableCell><TableCell className="text-right font-medium">{results.grower} Bags</TableCell></TableRow>
                                    <TableRow><TableCell>Developer</TableCell><TableCell className="text-right font-medium">{results.developer} Bags</TableCell></TableRow>
                                    <TableRow><TableCell>Pre-Layer</TableCell><TableCell className="text-right font-medium">{results.preLayer} Bags</TableCell></TableRow>
                                    <TableRow className="bg-secondary"><TableCell className="font-bold">Total Growing Phase</TableCell><TableCell className="text-right font-bold">{results.growingPhase} Bags</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Laying Phase (19-{inputs.weeks} Weeks)</h4>
                             <Table>
                                <TableBody>
                                    <TableRow className="bg-secondary"><TableCell className="font-bold">Total Laying Phase</TableCell><TableCell className="text-right font-bold">{results.layingPhase} Bags</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <Separator />
                        <div className="text-center bg-primary text-primary-foreground p-4 rounded-lg">
                            <p className="text-sm">Total Estimated Feed</p>
                            <p className="text-3xl font-bold">{results.totalFeed} Bags</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  )
}
