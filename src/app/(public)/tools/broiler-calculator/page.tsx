// src/app/(public)/tools/broiler-calculator/page.tsx
"use client";

import { useReducer, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Calculator, FileText, AlertTriangle, RefreshCw, Printer, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolPageLayout } from '../_components/tool-page-layout';
import { useReactToPrint } from 'react-to-print';
import { AppIcon } from '@/app/icon-component';
import { useToast } from '@/hooks/use-toast';

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
      return { ...initialState, showSummary: false };
    default:
      return state;
  }
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Printable Report Component
const PrintableReport = ({ reportData, state, generationTime, reportRef }: any) => (
    <div className="hidden">
        <div ref={reportRef} className="print-container p-8 font-sans">
            <header className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <AppIcon className="size-10 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold font-headline text-primary">PoultryMitra</h1>
                        <p className="text-sm text-muted-foreground">Broiler Farm Profitability Report</p>
                    </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                    <p>Generated on: {generationTime}</p>
                    <p>www.poultrymitra.com</p>
                </div>
            </header>
            
            <main className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Report for {state.chicks} Broiler Chicks</h2>
                
                <section className="mb-6">
                    <h3 className="font-bold text-lg mb-2 border-b pb-1">🌾 Feed Plan (in 50kg Bags)</h3>
                    <Table>
                        <TableHeader><TableRow><TableHead>Phase</TableHead><TableHead>Days</TableHead><TableHead>Bags</TableHead><TableHead className="text-right">Cost</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>Pre-Starter</TableCell><TableCell>1–14</TableCell><TableCell>{reportData.starterBags}</TableCell><TableCell className="text-right">{formatCurrency(reportData.starterBags * state.starterRate)}</TableCell></TableRow>
                            <TableRow><TableCell>Starter</TableCell><TableCell>15–28</TableCell><TableCell>{reportData.growerBags}</TableCell><TableCell className="text-right">{formatCurrency(reportData.growerBags * state.growerRate)}</TableCell></TableRow>
                            <TableRow><TableCell>Finisher</TableCell><TableCell>29–45</TableCell><TableCell>{reportData.finisherBags}</TableCell><TableCell className="text-right">{formatCurrency(reportData.finisherBags * state.finisherRate)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </section>
                
                <section className="mb-6">
                    <h3 className="font-bold text-lg mb-2 border-b pb-1">🔧 Equipment Required</h3>
                     <Table>
                        <TableHeader><TableRow><TableHead>Equipment</TableHead><TableHead>Phase</TableHead><TableHead>Quantity</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>Drinkers (Small)</TableCell><TableCell>Day 1–14</TableCell><TableCell>{reportData.smallDrinkers}</TableCell></TableRow>
                            <TableRow><TableCell>Drinkers (Large)</TableCell><TableCell>Day 15–45</TableCell><TableCell>{reportData.largeDrinkers}</TableCell></TableRow>
                            <TableRow><TableCell>Feeders (Small)</TableCell><TableCell>Day 1–14</TableCell><TableCell>{reportData.smallFeeders}</TableCell></TableRow>
                            <TableRow><TableCell>Feeders (Large)</TableCell><TableCell>Day 15–45</TableCell><TableCell>{reportData.largeFeeders}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </section>

                <section>
                    <h3 className="font-bold text-lg mb-2 border-b pb-1">📌 Financial Summary</h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-destructive mb-2">Cost Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Chick Cost:</span> <span>{formatCurrency(reportData.chickCost)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Total Feed Cost:</span> <span>{formatCurrency(reportData.totalFeedCost)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Management Cost:</span> <span>{formatCurrency(parseFloat(state.medicineCost))}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Other Costs:</span> <span>{formatCurrency(parseFloat(state.otherCost))}</span></div>
                                <div className="flex justify-between font-bold pt-2 border-t"><span className="text-destructive">Total Cost:</span> <span className="text-destructive">{formatCurrency(reportData.totalCost)}</span></div>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-green-600 mb-2">Income & Profit</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Total Weight Produced:</span> <span>{reportData.totalWeight.toLocaleString('en-IN')} kg</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Market Sale Price:</span> <span>{formatCurrency(parseFloat(state.marketPrice))}/kg</span></div>
                                <div className="flex justify-between font-bold pt-2 border-t"><span className="text-green-600">Total Income:</span> <span className="text-green-600">{formatCurrency(reportData.income)}</span></div>
                                <div className="flex justify-between font-bold text-xl mt-4 p-2 rounded bg-gray-100"><span>Estimated Profit:</span> <span>{formatCurrency(reportData.profit)}</span></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
                <p>Best wishes for your farm! - The PoultryMitra Team</p>
                <p className="mt-1">This is an estimation and actual results may vary. Always consult with a professional for final decisions.</p>
            </footer>
        </div>
    </div>
);


export default function BroilerCalculatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [generationTime, setGenerationTime] = useState("");

  const handlePrint = useReactToPrint({
      content: () => reportRef.current,
      documentTitle: `Broiler-Report-${state.chicks}-chicks`,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FIELD', field: e.target.id, value: e.target.value });
  };

  const calculations = useMemo(() => {
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
  }, [state]);

  const handleGenerate = () => {
    setGenerationTime(new Date().toLocaleString('en-IN'));
    dispatch({ type: 'SET_SUMMARY', payload: true });
  }
  const handleReset = () => dispatch({ type: 'RESET' });
  
  const handleShare = async () => {
      if (!calculations) return;
      
      const summaryText = `
PoultryMitra Broiler Farm Report
--------------------------------
Chicks: ${state.chicks}
Est. Total Cost: ${formatCurrency(calculations.totalCost)}
Est. Total Income: ${formatCurrency(calculations.income)}
Est. Profit: ${formatCurrency(calculations.profit)}
--------------------------------
Calculated via www.poultrymitra.com
      `;

      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Poultry Farm Report',
                  text: summaryText,
              });
          } catch (error) {
              console.error('Error sharing:', error);
              toast({ title: "Share Failed", description: "Could not share the report.", variant: "destructive"});
          }
      } else {
          navigator.clipboard.writeText(summaryText);
          toast({ title: "Copied to Clipboard", description: "Report summary copied to clipboard." });
      }
  };


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

                {state.showSummary && calculations && (
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
                                        <TableCell>{calculations.starterBags}</TableCell>
                                        <TableCell><Input id="starterRate" type="number" value={state.starterRate} onChange={handleInputChange} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>स्टार्टर</TableCell>
                                        <TableCell>15–28</TableCell>
                                        <TableCell>{calculations.growerBags}</TableCell>
                                        <TableCell><Input id="growerRate" type="number" value={state.growerRate} onChange={handleInputChange} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>फिनिशर</TableCell>
                                        <TableCell>29–45</TableCell>
                                        <TableCell>{calculations.finisherBags}</TableCell>
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
                                    <TableRow><TableCell>ड्रिंकर (छोटे)</TableCell><TableCell>दिन 1–14</TableCell><TableCell>{calculations.smallDrinkers}</TableCell></TableRow>
                                    <TableRow><TableCell>ड्रिंकर (बड़े)</TableCell><TableCell>दिन 15–45</TableCell><TableCell>{calculations.largeDrinkers}</TableCell></TableRow>
                                    <TableRow><TableCell>फीडर (छोटे)</TableCell><TableCell>दिन 1–14</TableCell><TableCell>{calculations.smallFeeders}</TableCell></TableRow>
                                    <TableRow><TableCell>फीडर (बड़े)</TableCell><TableCell>दिन 15–45</TableCell><TableCell>{calculations.largeFeeders}</TableCell></TableRow>
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
                                        <div className="flex justify-between items-center font-semibold"><span>फीड लागत:</span><span>{formatCurrency(calculations.totalFeedCost)}</span></div>
                                        <div className="flex justify-between items-center font-bold text-lg text-destructive"><span>कुल लागत:</span><span>{formatCurrency(calculations.totalCost)}</span></div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-green-600">आय और लाभ (Income & Profit)</h4>
                                        <div className="flex justify-between items-center text-sm"><Label>बाजार भाव (₹/किग्रा)</Label><Input id="marketPrice" type="number" value={state.marketPrice} onChange={handleInputChange} className="w-24 h-8" /></div>
                                        <Separator />
                                        <div className="flex justify-between items-center font-semibold"><span>कुल उत्पादित मांस:</span><span>{calculations.totalWeight.toLocaleString('en-IN')} किग्रा</span></div>
                                        <div className="flex justify-between items-center font-bold text-lg text-green-600"><span>कुल आय:</span><span>{formatCurrency(calculations.income)}</span></div>
                                        <div className={cn("flex justify-between font-bold text-xl p-3 rounded-md", calculations.profit > 0 ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive")}><span>अनुमानित लाभ:</span><span>{formatCurrency(calculations.profit)}</span></div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch gap-2 pt-4">
                                     <div className="rounded-lg border bg-blue-500/10 p-4 text-sm text-blue-800 dark:text-blue-300">
                                        <strong className="font-semibold">🌟 टिप (Tip):</strong> बिक्री से 6-12 घंटे पहले फीड बंद कर दें। पानी जारी रखें। इससे आंत साफ रहेगी और बाजार में अच्छा दाम मिलेगा।
                                    </div>
                                     <div className="flex gap-2">
                                        <Button onClick={handlePrint} className="w-full" variant="outline"><Printer className="mr-2"/>Print Report</Button>
                                        <Button onClick={handleShare} className="w-full" variant="outline"><Share2 className="mr-2"/>Share</Button>
                                    </div>
                                </CardFooter>
                            </Card>
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
        
        {calculations && <PrintableReport reportData={calculations} state={state} generationTime={generationTime} reportRef={reportRef} />}
    </ToolPageLayout>
  );
}
