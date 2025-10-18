// src/app/_components/feed-comparison-calculator.tsx
"use client";

import { useState, useReducer, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Trash2, PlusCircle, RefreshCw, Download, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const brandSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Brand name is required'),
  priceBag: z.coerce.number().min(0.01, 'Price must be positive'),
  protein: z.coerce.number().min(0, 'Protein must be non-negative'),
  energy: z.coerce.number().min(0, 'Energy must be non-negative'),
  obsFcr: z.coerce.number().positive('FCR must be positive').optional().or(z.literal('')),
});

const formSchema = z.object({
  bagWeight: z.coerce.number().min(1, 'Bag weight must be at least 1'),
  brands: z.array(brandSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function FeedComparisonCalculator() {
  const [results, setResults] = useState<any[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bagWeight: 50,
      brands: Array.from({ length: 2 }, (_, i) => ({
        id: Date.now().toString(36) + i,
        name: '', priceBag: '', protein: '', energy: '', obsFcr: ''
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "brands",
  });

  const watchedBrands = useWatch({ control: form.control, name: 'brands' });
  const watchedBagWeight = useWatch({ control: form.control, name: 'bagWeight' });

  const bestValues = useMemo(() => {
    if (!results) return { minPriceKg: null, minCostPerKgGain: null };
    const validPriceKg = results.map(d => d.priceKg).filter(v => v !== null) as number[];
    const minPriceKg = validPriceKg.length ? Math.min(...validPriceKg) : null;
    const validCostPerKgGain = results.map(d => d.costPerKgGain).filter(v => v !== null) as number[];
    const minCostPerKgGain = validCostPerKgGain.length ? Math.min(...validCostPerKgGain) : null;
    return { minPriceKg, minCostPerKgGain };
  }, [results]);

  function onSubmit(data: FormValues) {
    const calculatedData = data.brands.map(brand => {
      const priceKg = (brand.priceBag || 0) / (data.bagWeight || 1);
      const costPerKgGain = brand.obsFcr ? priceKg * (Number(brand.obsFcr) || 0) : null;
      return {
        ...brand,
        priceKg: priceKg > 0 ? priceKg : null,
        costPerKgGain: costPerKgGain && costPerKgGain > 0 ? costPerKgGain : null
      };
    });
    setResults(calculatedData);
  }

  const exportCsv = () => {
    if (!results) return;
    const headers = ['Brand', 'Price/Bag', 'Price/Kg', 'Protein (%)', 'Energy (Kcal/kg)', 'Observed FCR', 'Cost/kg Gain (₹)'];
    const lines = [headers.join(',')];
    results.forEach(d => {
        const line = [
            d.name || '(Unnamed)', d.priceBag, d.priceKg?.toFixed(2) || 'N/A', d.protein,
            d.energy, d.obsFcr || 'N/A', d.costPerKgGain?.toFixed(2) || 'N/A'
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
        lines.push(line);
    });
    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feed_comparison.csv';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Alert><AlertDescription className="text-xs">Add brands, fill in Price/Bag and Nutrition info, then click Compare. Default bag weight is 50 kg.</AlertDescription></Alert>
            <div className="w-full md:w-1/3">
                <FormField control={form.control} name="bagWeight" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bag Weight (Kg)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
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
                      <div className="flex items-center gap-1">Observed FCR
                        <TooltipProvider><Tooltip>
                          <TooltipTrigger><HelpCircle className="size-4 text-muted-foreground"/></TooltipTrigger>
                          <TooltipContent><p>Optional: Enter the actual FCR you got from using this feed.</p></TooltipContent>
                        </Tooltip></TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell><FormField control={form.control} name={`brands.${index}.name`} render={({ field }) => <Input placeholder={`Brand #${index + 1}`} {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`brands.${index}.priceBag`} render={({ field }) => <Input type="number" placeholder="e.g., 2200" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`brands.${index}.protein`} render={({ field }) => <Input type="number" placeholder="e.g., 21" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`brands.${index}.energy`} render={({ field }) => <Input type="number" placeholder="e.g., 3000" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`brands.${index}.obsFcr`} render={({ field }) => <Input type="number" step="0.01" placeholder="e.g., 1.65" {...field} />} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="size-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {results && (
              <div className="space-y-4 pt-4 animate-in fade-in-50">
                <h3 className="font-headline text-xl">Comparison Result</h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Brand</TableHead><TableHead className="text-right">Price/kg (₹)</TableHead>
                      <TableHead className="text-right">Protein (%)</TableHead><TableHead className="text-right">Energy (Kcal/kg)</TableHead>
                      <TableHead className="text-right">Observed FCR</TableHead><TableHead className="text-right">Cost / kg gain (₹)</TableHead>
                    </TableRow></TableHeader>
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
                <Alert><AlertTitle>🌟 Tip</AlertTitle><AlertDescription className="text-xs">Compare Protein % and Observed FCR along with the price. Cheaper feed doesn't always mean lower cost if the FCR is poor.</AlertDescription></Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => append({ id: Date.now().toString(36), name: '', priceBag: '', protein: '', energy: '', obsFcr: '' })}><PlusCircle className="mr-2"/> Add Brand</Button>
            <Button type="submit"><LineChart className="mr-2"/> Compare</Button>
            <Button type="button" variant="secondary" onClick={() => { form.reset(); setResults(null); }}><RefreshCw className="mr-2"/> Reset</Button>
            {results && <Button type="button" variant="secondary" onClick={exportCsv}><Download className="mr-2"/> Export CSV</Button>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
