// src/app/_components/feed-comparison-calculator.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Trash2, PlusCircle, RefreshCw, Download, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

interface BrandData {
  id: string;
  name: string;
  priceBag: number | '';
  protein: number | '';
  energy: number | '';
  obsFcr: number | '';
}

interface ResultData extends BrandData {
    priceKg: number | null;
    costPerKgGain: number | null;
}

const initialRows = 3;

export function FeedComparisonCalculator() {
  const [bagWeight, setBagWeight] = useState(50);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [results, setResults] = useState<ResultData[] | null>(null);

  const initRows = useCallback(() => {
    const initialData = Array.from({ length: initialRows }, (_, i) => ({
      id: Date.now().toString(36) + i,
      name: '', priceBag: '', protein: '', energy: '', obsFcr: ''
    }));
    setBrands(initialData);
  }, []);

  useEffect(() => {
    initRows();
  }, [initRows]);

  const handleBrandChange = (id: string, field: keyof BrandData, value: string) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, [field]: value === '' ? '' : (field === 'name' ? value : parseFloat(value)) } : b));
  };

  const addRow = () => {
    setBrands(prev => [...prev, { id: Date.now().toString(36), name: '', priceBag: '', protein: '', energy: '', obsFcr: '' }]);
  };

  const deleteRow = (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
  };
  
  const resetForm = () => {
    setBagWeight(50);
    initRows();
    setResults(null);
  };

  const bestValues = useMemo(() => {
    if (!results) return { minPriceKg: null, minCostPerKgGain: null };
    const validPriceKg = results.filter(d => d.priceKg !== null).map(d => d.priceKg as number);
    const minPriceKg = validPriceKg.length ? Math.min(...validPriceKg) : null;
    const validCostPerKgGain = results.filter(d => d.costPerKgGain !== null).map(d => d.costPerKgGain as number);
    const minCostPerKgGain = validCostPerKgGain.length ? Math.min(...validCostPerKgGain) : null;
    return { minPriceKg, minCostPerKgGain };
  }, [results]);

  const compareBrands = () => {
    const calculatedData = brands.map(brand => {
      const priceBag = Number(brand.priceBag) || 0;
      const obsFcr = Number(brand.obsFcr) || null;
      const priceKg = priceBag > 0 && bagWeight > 0 ? (priceBag / bagWeight) : null;
      const costPerKgGain = (priceKg !== null && obsFcr) ? priceKg * obsFcr : null;
      return {
        ...brand,
        priceKg,
        costPerKgGain
      };
    });
    setResults(calculatedData);
  };

  const exportCsv = () => {
    if (!results) return;
    const headers = ['Brand', 'PricePerBag', 'PricePerKg', 'Protein', 'Energy', 'ObservedFCR', 'CostPerKgGain'];
    const lines = [headers.join(',')];
    results.forEach(d => {
        const line = [
            d.name || '(Unnamed)',
            d.priceBag,
            d.priceKg?.toFixed(2),
            d.protein,
            d.energy,
            d.obsFcr,
            d.costPerKgGain?.toFixed(2)
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
        lines.push(line);
    });
    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feed_comparison.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
             <div className="flex items-center gap-2">
                <LineChart className="size-8 text-primary" />
                <div>
                    <CardTitle className="font-headline text-2xl">Feed Comparison Calculator</CardTitle>
                    <CardDescription>Compare feed brands by price and nutrition to find the best value.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <Alert>
                <AlertTitle>How to Use</AlertTitle>
                <AlertDescription className="text-xs">
                    Add brands, fill in Price/Bag and Nutrition info, then click Compare. Default bag weight is 50 kg.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="bagWeight">Bag Weight (Kg)</Label>
                    <Input id="bagWeight" type="number" value={bagWeight} onChange={e => setBagWeight(Number(e.target.value))} min="1" />
                </div>
            </div>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[150px]">Brand</TableHead>
                            <TableHead className="min-w-[120px]">Price / Bag (₹)</TableHead>
                            <TableHead className="min-w-[120px]">Protein (%)</TableHead>
                            <TableHead className="min-w-[120px]">Energy (Kcal/kg)</TableHead>
                            <TableHead className="min-w-[150px]">
                                 <div className="flex items-center gap-1">
                                    Observed FCR
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="size-4 text-muted-foreground"/></TooltipTrigger>
                                            <TooltipContent><p>Optional: Enter the actual FCR you got from using this feed.</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brands.map((brand, index) => (
                            <TableRow key={brand.id}>
                                <TableCell><Input value={brand.name} onChange={e => handleBrandChange(brand.id, 'name', e.target.value)} placeholder={`Brand #${index + 1}`} /></TableCell>
                                <TableCell><Input type="number" value={brand.priceBag} onChange={e => handleBrandChange(brand.id, 'priceBag', e.target.value)} placeholder="e.g., 2200" /></TableCell>
                                <TableCell><Input type="number" value={brand.protein} onChange={e => handleBrandChange(brand.id, 'protein', e.target.value)} placeholder="e.g., 21" /></TableCell>
                                <TableCell><Input type="number" value={brand.energy} onChange={e => handleBrandChange(brand.id, 'energy', e.target.value)} placeholder="e.g., 3000" /></TableCell>
                                <TableCell><Input type="number" step="0.01" value={brand.obsFcr} onChange={e => handleBrandChange(brand.id, 'obsFcr', e.target.value)} placeholder="e.g., 1.65" /></TableCell>
                                <TableCell><Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRow(brand.id)}><Trash2 className="size-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={addRow}><PlusCircle className="mr-2"/> Add Brand</Button>
                <Button onClick={compareBrands}><LineChart className="mr-2"/> Compare</Button>
                <Button variant="secondary" onClick={resetForm}><RefreshCw className="mr-2"/> Reset</Button>
                {results && <Button variant="secondary" onClick={exportCsv}><Download className="mr-2"/> Export CSV</Button>}
            </div>

            {results && (
                <div className="space-y-4 pt-4 animate-in fade-in-50">
                    <h3 className="font-headline text-xl">Comparison Result</h3>
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Brand</TableHead>
                                    <TableHead className="text-right">Price/kg (₹)</TableHead>
                                    <TableHead className="text-right">Protein (%)</TableHead>
                                    <TableHead className="text-right">Energy (Kcal/kg)</TableHead>
                                    <TableHead className="text-right">Observed FCR</TableHead>
                                    <TableHead className="text-right">
                                         <div className="flex items-center gap-1 justify-end">
                                            Cost / kg gain (₹)
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><HelpCircle className="size-4 text-muted-foreground"/></TooltipTrigger>
                                                    <TooltipContent><p>Feed cost to produce 1kg of live bird weight.</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map(d => (
                                     <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.name}</TableCell>
                                        <TableCell className={cn("text-right", d.priceKg === bestValues.minPriceKg && "bg-green-500/10 text-green-700 font-bold")}>{d.priceKg ? `₹${d.priceKg.toFixed(2)}` : '-'}</TableCell>
                                        <TableCell className="text-right">{d.protein || '-'}</TableCell>
                                        <TableCell className="text-right">{d.energy || '-'}</TableCell>
                                        <TableCell className="text-right">{d.obsFcr || '-'}</TableCell>
                                        <TableCell className={cn("text-right", d.costPerKgGain === bestValues.minCostPerKgGain && "bg-green-500/10 text-green-700 font-bold")}>{d.costPerKgGain ? `₹${d.costPerKgGain.toFixed(2)}` : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Alert>
                        <AlertTitle>🌟 Tip</AlertTitle>
                        <AlertDescription className="text-xs">
                           Compare Protein % and Observed FCR along with the price. Cheaper feed doesn't always mean lower cost if the FCR is poor.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </CardContent>
    </Card>
  )
}
