// src/app/_components/broiler-calculator.tsx
"use client";

import { useState, useMemo, useCallback }from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input }from '@/components/ui/input';
import { Label }from '@/components/ui/label';
import { Button }from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calculator, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialState = {
  chicks: 1000,
  starterRate: 2200,
  growerRate: 2100,
  finisherRate: 2000,
  chickCostPerUnit: 22,
  medicineCost: 2000,
  otherCost: 10000,
  marketPrice: 120,
};

export function BroilerCalculator() {
  const [inputs, setInputs] = useState(initialState);
  const [showSummary, setShowSummary] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: Number(value) }));
  };

  const calculations = useMemo(() => {
    const { chicks, starterRate, growerRate, finisherRate, chickCostPerUnit, medicineCost, otherCost, marketPrice } = inputs;
    
    if (chicks <= 0) return null;

    const starterBags = Math.ceil((chicks * 0.5) / 50);
    const growerBags = Math.ceil((chicks * 1.0) / 50);
    const finisherBags = Math.ceil((chicks * 1.5) / 50);
    const totalBags = starterBags + growerBags + finisherBags;

    const smallDrinkers = Math.ceil(chicks * 0.025);
    const largeDrinkers = Math.ceil(chicks * 0.025);
    const smallFeeders = Math.ceil(chicks * 0.02);
    const largeFeeders = Math.ceil(chicks * 0.02);

    const starterCost = starterBags * starterRate;
    const growerCost = growerBags * growerRate;
    const finisherCost = finisherBags * finisherRate;
    const totalFeedCost = starterCost + growerCost + finisherCost;

    const chickCost = chicks * chickCostPerUnit;
    const totalCost = chickCost + totalFeedCost + medicineCost + otherCost;

    const avgWeight = 2.0;
    const totalWeight = chicks * avgWeight;
    const income = totalWeight * marketPrice;
    const profit = income - totalCost;

    return {
      starterBags, growerBags, finisherBags, totalBags,
      smallDrinkers, largeDrinkers, smallFeeders, largeFeeders,
      totalFeedCost, chickCost, totalCost, income, profit,
      totalWeight
    };
  }, [inputs]);

  const generatePlan = useCallback(() => {
      if (inputs.chicks > 0) {
        setShowSummary(true);
      }
  }, [inputs.chicks]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Calculator className="size-8 text-primary" />
            <div>
                 <CardTitle className="font-headline text-2xl">Broiler Farm Calculator</CardTitle>
                 <CardDescription>Estimate your costs and profits for a 45-day broiler cycle.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <Alert>
            <AlertTitle>शैक्षिक उद्देश्य (Educational Purpose)</AlertTitle>
            <AlertDescription>
                यह उपकरण केवल सूचना और फार्म प्रबंधन सहायता के लिए है। किसी भी गंभीर स्थिति में स्थानीय पंजीकृत विशेषज्ञ से मार्गदर्शन लें।
            </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
                <Label htmlFor="chicks" className="font-bold">चूजों की संख्या डालें (Enter Number of Chicks):</Label>
                <Input id="chicks" type="number" min="1" placeholder="e.g., 1000" value={inputs.chicks} onChange={handleInputChange} />
            </div>
             <Button onClick={generatePlan} size="lg">प्लान जनरेट करें</Button>
        </div>

        {showSummary && calculations && (
            <div className="space-y-6 animate-in fade-in-50">
                {/* Feed Plan Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">🌾 फीड प्लान (50 किग्रा बैग में)</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>फेज़</TableHead>
                                <TableHead>दिन</TableHead>
                                <TableHead>बैग</TableHead>
                                <TableHead className="w-[150px]">बैग दाम (₹)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>PRE-स्टार्टर</TableCell>
                                <TableCell>1–14</TableCell>
                                <TableCell>{calculations.starterBags}</TableCell>
                                <TableCell><Input id="starterRate" type="number" value={inputs.starterRate} onChange={handleInputChange} /></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>स्टार्टर</TableCell>
                                <TableCell>15–28</TableCell>
                                <TableCell>{calculations.growerBags}</TableCell>
                                <TableCell><Input id="growerRate" type="number" value={inputs.growerRate} onChange={handleInputChange} /></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>फिनिशर</TableCell>
                                <TableCell>29–45</TableCell>
                                <TableCell>{calculations.finisherBags}</TableCell>
                                <TableCell><Input id="finisherRate" type="number" value={inputs.finisherRate} onChange={handleInputChange} /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                 {/* Equipment Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">🔧 फीडर और ड्रिंकर की संख्या</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>उपकरण</TableHead>
                                <TableHead>चरण</TableHead>
                                <TableHead>संख्या</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            <TableRow><TableCell>ड्रिंकर (छोटे)</TableCell><TableCell>दिन 1–14</TableCell><TableCell>{calculations.smallDrinkers}</TableCell></TableRow>
                            <TableRow><TableCell>ड्रिंकर (बड़े)</TableCell><TableCell>दिन 15–45</TableCell><TableCell>{calculations.largeDrinkers}</TableCell></TableRow>
                            <TableRow><TableCell>फीडर (छोटे)</TableCell><TableCell>दिन 1–14</TableCell><TableCell>{calculations.smallFeeders}</TableCell></TableRow>
                            <TableRow><TableCell>फीडर (बड़े)</TableCell><TableCell>दिन 15–45</TableCell><TableCell>{calculations.largeFeeders}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
                
                 {/* Summary Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">📌 निष्कर्ष: पूर्ण फार्म प्लान सारांश</h3>
                     <Card className="bg-secondary/50">
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {/* Costs Column */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-destructive">लागत विवरण (Cost Details)</h4>
                                <div className="flex justify-between items-center text-sm">
                                    <Label>चूजा लागत (₹/चूजा)</Label>
                                    <Input id="chickCostPerUnit" type="number" value={inputs.chickCostPerUnit} onChange={handleInputChange} className="w-24 h-8" />
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <Label>प्रबंधन लागत (₹)</Label>
                                    <Input id="medicineCost" type="number" value={inputs.medicineCost} onChange={handleInputChange} className="w-24 h-8" />
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <Label>अन्य खर्च (₹)</Label>
                                    <Input id="otherCost" type="number" value={inputs.otherCost} onChange={handleInputChange} className="w-24 h-8" />
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center font-semibold">
                                    <span>फीड लागत:</span>
                                    <span>{formatCurrency(calculations.totalFeedCost)}</span>
                                </div>
                                 <div className="flex justify-between items-center font-bold text-lg text-destructive">
                                    <span>कुल लागत:</span>
                                    <span>{formatCurrency(calculations.totalCost)}</span>
                                </div>
                            </div>
                            {/* Income & Profit Column */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-green-600">आय और लाभ (Income & Profit)</h4>
                                <div className="flex justify-between items-center text-sm">
                                    <Label>बाजार भाव (₹/किग्रा)</Label>
                                    <Input id="marketPrice" type="number" value={inputs.marketPrice} onChange={handleInputChange} className="w-24 h-8" />
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center font-semibold">
                                    <span>कुल उत्पादित मांस:</span>
                                    <span>{calculations.totalWeight.toLocaleString('en-IN')} किग्रा</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-lg text-green-600">
                                    <span>कुल आय:</span>
                                    <span>{formatCurrency(calculations.income)}</span>
                                </div>
                                <div className={cn("flex justify-between font-bold text-xl p-3 rounded-md", calculations.profit > 0 ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive")}>
                                    <span>अनुमानित लाभ:</span>
                                    <span>{formatCurrency(calculations.profit)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border bg-blue-500/10 p-4 text-sm text-blue-800 dark:text-blue-300">
                    <strong className="font-semibold">🌟 टिप (Tip):</strong> बिक्री से 6-12 घंटे पहले फीड बंद कर दें। पानी जारी रखें। इससे आंत साफ रहेगी और बाजार में अच्छा दाम मिलेगा।
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
