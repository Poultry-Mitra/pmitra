// src/app/(public)/tools/layer-feed-consumption/page.tsx
"use client";

import { useReducer, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Bird, RefreshCw } from 'lucide-react';
import { ToolPageLayout } from '../_components/tool-page-layout';

const initialState = {
  totalBirds: '1000',
  weeks: '72',
  results: null as any,
};

function reducer(state: typeof initialState, action: { type: string, payload?: any }) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function LayerFeedConsumptionPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const calculateFeed = () => {
    const totalBirds = parseInt(state.totalBirds) || 0;
    const weeks = parseInt(state.weeks) || 0;

    if (totalBirds > 0 && weeks > 0) {
      const chickCrumb = Math.round((((totalBirds * 8) + (totalBirds * 13) + (totalBirds * 20) + (totalBirds * 26) + (totalBirds * 31)) * 7 / 1000 / 50));
      const grower = Math.round((((totalBirds * 35) + (totalBirds * 39) + (totalBirds * 43) + (totalBirds * 46) + (totalBirds * 49)) * 7 / 1000 / 50));
      const developer = Math.round((((totalBirds * 52) + (totalBirds * 55) + (totalBirds * 58) + (totalBirds * 60) + (totalBirds * 64)) * 7 / 1000 / 50));
      const preLayer = Math.round((((totalBirds * 66) + (totalBirds * 73) + (totalBirds * 75)) * 7 / 1000 / 50));
      const growingPhase = chickCrumb + grower + developer + preLayer;
      const layingPhase = weeks > 18 ? Math.round(((totalBirds * (weeks - 18) * 115) * 7 / 1000 / 50)) : 0;
      const totalFeed = growingPhase + layingPhase;

      dispatch({ type: 'SET_RESULTS', payload: { chickCrumb, grower, developer, preLayer, growingPhase, layingPhase, totalFeed } });
    } else {
      dispatch({ type: 'SET_RESULTS', payload: null });
    }
  };

  const handleReset = () => dispatch({ type: 'RESET' });

  return (
    <ToolPageLayout
      title="Layer Feed Consumption Calculator"
      description="Estimate total feed required for your layer birds over a period."
    >
      <Card>
        <CardHeader>
          <CardTitle>Production Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalBirds">Total Birds</Label>
            <Input id="totalBirds" type="number" value={state.totalBirds} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'totalBirds', value: e.target.value } })} min="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weeks">Total Weeks</Label>
            <Input id="weeks" type="number" value={state.weeks} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'weeks', value: e.target.value } })} min="1" />
          </div>
          <Button onClick={calculateFeed} className="w-full">
            <Bird className="mr-2" />
            Calculate Feed
          </Button>
        </CardContent>
        {state.results && (
          <CardFooter className="flex-col items-stretch space-y-6 animate-in fade-in-50">
            <div>
              <h4 className="font-semibold mb-2">Growing Phase (0-18 Weeks)</h4>
              <Table>
                <TableBody>
                  <TableRow><TableCell>Chick Crumb</TableCell><TableCell className="text-right font-medium">{state.results.chickCrumb} Bags</TableCell></TableRow>
                  <TableRow><TableCell>Grower</TableCell><TableCell className="text-right font-medium">{state.results.grower} Bags</TableCell></TableRow>
                  <TableRow><TableCell>Developer</TableCell><TableCell className="text-right font-medium">{state.results.developer} Bags</TableCell></TableRow>
                  <TableRow><TableCell>Pre-Layer</TableCell><TableCell className="text-right font-medium">{state.results.preLayer} Bags</TableCell></TableRow>
                  <TableRow className="bg-secondary"><TableCell className="font-bold">Total Growing Phase</TableCell><TableCell className="text-right font-bold">{state.results.growingPhase} Bags</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Laying Phase (19-{state.weeks} Weeks)</h4>
              <Table>
                <TableBody>
                  <TableRow className="bg-secondary"><TableCell className="font-bold">Total Laying Phase</TableCell><TableCell className="text-right font-bold">{state.results.layingPhase} Bags</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div className="text-center bg-primary text-primary-foreground p-4 rounded-lg">
              <p className="text-sm">Total Estimated Feed</p>
              <p className="text-3xl font-bold">{state.results.totalFeed} Bags</p>
            </div>
             <Button onClick={handleReset} className="w-full" variant="outline">
                <RefreshCw className="mr-2"/>
                Reset
            </Button>
          </CardFooter>
        )}
      </Card>
    </ToolPageLayout>
  );
}