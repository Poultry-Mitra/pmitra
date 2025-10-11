"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { suggestFarmImprovements, type SuggestFarmImprovementsInput } from '@/ai/flows/suggest-farm-improvements';
import { WandSparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AISuggestions({ farmData }: { farmData: SuggestFarmImprovementsInput }) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string | null>(null);

    const handleGetSuggestions = async () => {
        setLoading(true);
        setSuggestions(null);
        try {
            const result = await suggestFarmImprovements(farmData);
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error("Failed to get AI suggestions", error);
            setSuggestions("Sorry, I couldn't generate suggestions at this time. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={handleGetSuggestions} disabled={loading} className="w-full">
                <WandSparkles className="mr-2" />
                {loading ? 'Analyzing Data...' : 'Get AI Suggestions'}
            </Button>
            
            {loading && (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            )}
            
            {suggestions && (
                 <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap rounded-md border bg-secondary/50 p-4">
                    <h4 className="font-headline text-foreground">Recommendations</h4>
                    <p>{suggestions}</p>
                 </div>
            )}

            {!suggestions && !loading && (
                 <div className="text-center text-sm text-muted-foreground p-4">
                    Click the button to generate AI-powered recommendations based on your latest farm data.
                 </div>
            )}
        </div>
    );
}
