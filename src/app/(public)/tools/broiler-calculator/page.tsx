// src/app/(public)/tools/broiler-calculator/page.tsx
"use client";

import { useReducer } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Calculator, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolPageLayout } from '../_components/tool-page-layout';

const initialState = {
  chicks: '1000',
  starterRate: '2200',
  growerRate: '2100',
  finisherRate: '2000',
  chickCostPerUnit: '22',
  medicineCost: '2000',
  otherCost: '10000',
  marketPrice: '120',
  showSummary: false,
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_SUMMARY':
      return { ...state, showSummary: action.payload };
    case 'RESET':
      return { ...initialState, showSummary: state.showSummary };
    default:
      return state;
  }
}

export default function BroilerCalculatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FIELD', field: e.target.id, value: e.target.value });
  };

  const calculations = () => {
    const { chicks, starterRate, growerRate, finisherRate, chickCostPerUnit, medicineCost, otherCost, marketPrice } = state;
    const numChicks = parseInt(chicks) || 0;
    if (numChicks <= 0) return null;

    const starterBags = Math.ceil((numChicks * 0.5) / 50);
    const growerBags = Math.ceil((numChicks * 1.0) / 50);
    const finisherBags = Math.ceil((numChicks * 1.5) / 50);
    const totalBags = starterBags + growerBags + finisherBags;

    const smallDrinkers = Math.ceil(numChicks * 0.025);
    const largeDrinkers = Math.ceil(numChicks * 0.025);
    const smallFeeders = Math.ceil(numChicks * 0.02);
    const largeFeeders = Math.ceil(numChicks * 0.02);

    const starterCost = starterBags * (parseFloat(starterRate) || 0);
    const growerCost = growerBags * (parseFloat(growerRate) || 0);
    const finisherCost = finisherBags * (parseFloat(finisherRate) || 0);
    const totalFeedCost = starterCost + growerCost + finisherCost;

    const numChickCost = numChicks * (parseFloat(chickCostPerUnit) || 0);
    const totalCost = numChickCost + totalFeedCost + (parseFloat(medicineCost) || 0) + (parseFloat(otherCost) || 0);

    const avgWeight = 2.0;
    const totalWeight = numChicks * avgWeight;
    const income = totalWeight * (parseFloat(marketPrice) || 0);
    const profit = income - totalCost;

    return {
      starterBags, growerBags, finisherBags, totalBags,
      smallDrinkers, largeDrinkers, smallFeeders, largeFeeders,
      totalFeedCost, chickCost: numChickCost, totalCost, income, profit,
      totalWeight
    };
  };

  const results = calculations();

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleGenerate = () => dispatch({ type: 'SET_SUMMARY', payload: true });
  const handleReset = () => dispatch({ type: 'RESET' });

  return (
    <ToolPageLayout
        title="Broiler Farm Calculator"
        description="Estimate your costs and profits for a 45-day broiler cycle."
    >
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-4 flex-1 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="chicks" className="font-bold">चूजों की संख्या डालें (Enter Number of Chicks):</Label>
                        <Input id="chicks" type="number" min="1" placeholder="e.g., 1000" value={state.chicks} onChange={handleInputChange} />
                    </div>
                </div>

                {state.showSummary && results && (
                    <div className="space-y-6 animate-in fade-in-50 pt-6">
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
                                        <TableCell>{results.starterBags}</TableCell>
                                        <TableCell><Input id="starterRate" type="number" value={state.starterRate} onChange={handleInputChange} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>स्टार्टर</TableCell>
                                        <TableCell>15–28</TableCell>
                                        <TableCell>{results.growerBags}</TableCell>
                                        <TableCell><Input id="growerRate" type="number" value={state.growerRate} onChange={handleInputChange} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>फिनिशर</TableCell>
                                        <TableCell>29–45</TableCell>
                                        <TableCell>{results.finisherBags}</TableCell>
                                        <TableCell><Input id="finisherRate" type="number" value={state.finisherRate} onChange={handleInputChange} /></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">🔧 फीडर और ड्रिंकर की संख्या</h3>
                            <Table>
                                <TableHeader><TableRow><TableHead>उपकरण</TableHead><TableHead>चरण</TableHead><TableHead>संख्या</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    <TableRow><TableCell>ड्रिंकर (छोटे)</TableCell><TableCell>दिन 1–14</TableCell><TableCell>{results.smallDrinkers}</TableCell></TableRow>
                                    <TableRow><TableCell>ड्रिंकर (बड़े)</TableCell><TableCell>दिन 15–45</TableCell><TableCell>{results.largeDrinkers}</TableCell></TableRow>
                                    <TableRow><TableCell>फीडर (छोटे)</TableCell><TableCell>दिन 1–14</TableCell><TableCell>{results.smallFeeders}</TableCell></TableRow>
                                    <TableRow><TableCell>फीडर (बड़े)</TableCell><TableCell>दिन 15–45</TableCell><TableCell>{results.largeFeeders}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">📌 निष्कर्ष: पूर्ण फार्म प्लान सारांश</h3>
                            <Card className="bg-secondary/50">
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-destructive">लागत विवरण (Cost Details)</h4>
                                        <div className="flex justify-between items-center text-sm"><Label>चूजा लागत (₹/चूजा)</Label><Input id="chickCostPerUnit" type="number" value={state.chickCostPerUnit} onChange={handleInputChange} className="w-24 h-8" /></div>
                                        <div className="flex justify-between items-center text-sm"><Label>प्रबंधन लागत (₹)</Label><Input id="medicineCost" type="number" value={state.medicineCost} onChange={handleInputChange} className="w-24 h-8" /></div>
                                        <div className="flex justify-between items-center text-sm"><Label>अन्य खर्च (₹)</Label><Input id="otherCost" type="number" value={state.otherCost} onChange={handleInputChange} className="w-24 h-8" /></div>
                                        <Separator />
                                        <div className="flex justify-between items-center font-semibold"><span>फीड लागत:</span><span>{formatCurrency(results.totalFeedCost)}</span></div>
                                        <div className="flex justify-between items-center font-bold text-lg text-destructive"><span>कुल लागत:</span><span>{formatCurrency(results.totalCost)}</span></div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-green-600">आय और लाभ (Income & Profit)</h4>
                                        <div className="flex justify-between items-center text-sm"><Label>बाजार भाव (₹/किग्रा)</Label><Input id="marketPrice" type="number" value={state.marketPrice} onChange={handleInputChange} className="w-24 h-8" /></div>
                                        <Separator />
                                        <div className="flex justify-between items-center font-semibold"><span>कुल उत्पादित मांस:</span><span>{results.totalWeight.toLocaleString('en-IN')} किग्रा</span></div>
                                        <div className="flex justify-between items-center font-bold text-lg text-green-600"><span>कुल आय:</span><span>{formatCurrency(results.income)}</span></div>
                                        <div className={cn("flex justify-between font-bold text-xl p-3 rounded-md", results.profit > 0 ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive")}><span>अनुमानित लाभ:</span><span>{formatCurrency(results.profit)}</span></div>
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
            <CardFooter className="gap-2">
                 <Button onClick={handleGenerate} size="lg" className="w-full" disabled={!state.chicks || parseInt(state.chicks) <= 0}>
                    <Calculator className="mr-2"/>
                    प्लान जनरेट करें
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg" className="w-full">
                    <RefreshCw className="mr-2"/>
                    Reset
                </Button>
            </CardFooter>
        </Card>
    </ToolPageLayout>
  );
}