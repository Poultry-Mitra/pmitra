
// src/app/(app)/biosecurity/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from "../(app)/_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { WandSparkles, Loader2, ShieldAlert } from "lucide-react";
import type { BiosecurityChecklistItem } from '@/lib/types';
import { suggestBiosecurityImprovements } from '@/ai/flows/suggest-biosecurity-improvements';
import { useAppUser } from '@/app/app-provider';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';

const checklistItems: BiosecurityChecklistItem[] = [
    { id: 'isolation_fencing', text: 'Farm is securely fenced to prevent unauthorized entry.', category: 'Isolation' },
    { id: 'isolation_locked_gates', text: 'Gates are kept locked when not in use.', category: 'Isolation' },
    { id: 'isolation_wild_bird_proofing', text: 'Poultry houses are netted to prevent entry of wild birds.', category: 'Isolation' },
    { id: 'isolation_quarantine', text: 'New birds are quarantined for at least 14-21 days before joining the main flock.', category: 'Isolation' },
    
    { id: 'traffic_visitor_log', text: 'A visitor log is maintained for all non-staff entries.', category: 'Traffic Control' },
    { id: 'traffic_footbaths', text: 'Functional footbaths with fresh disinfectant are at all entry points.', category: 'Traffic Control' },
    { id: 'traffic_dedicated_attire', text: 'Dedicated boots and clothing are used inside poultry houses.', category: 'Traffic Control' },
    { id: 'traffic_vehicle_disinfection', text: 'Vehicles entering the farm are disinfected.', category: 'Traffic Control' },
    
    { id: 'sanitation_all_in_out', text: 'An "All-In/All-Out" system is practiced per house.', category: 'Sanitation' },
    { id: 'sanitation_clean_feeders', text: 'Feeders and drinkers are cleaned and disinfected regularly (daily/weekly).', category: 'Sanitation' },
    { id: 'sanitation_dry_litter', text: 'Litter is kept dry and managed properly to avoid ammonia buildup.', category: 'Sanitation' },
    { id: 'sanitation_pest_control', text: 'An active rodent and insect control program is in place.', category: 'Sanitation' },
    { id: 'sanitation_carcass_disposal', text: 'Dead birds are collected daily and disposed of safely (incineration/burial).', category: 'Sanitation' },
];

export default function BiosecurityPage() {
    const { user, loading: userLoading } = useAppUser();
    const firestore = useFirestore();
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.biosecurityMeasures) {
            setCheckedItems(user.biosecurityMeasures);
        }
    }, [user]);

    const handleCheckChange = (id: string, checked: boolean) => {
        const newCheckedItems = { ...checkedItems, [id]: checked };
        setCheckedItems(newCheckedItems);
        // Persist non-blocking
        if (firestore && user) {
            const userRef = doc(firestore, 'users', user.id);
            updateDocumentNonBlocking(userRef, { biosecurityMeasures: newCheckedItems }, null);
        }
    };

    const score = useMemo(() => {
        const total = checklistItems.length;
        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        if (total === 0) return 0;
        return Math.round((checkedCount / total) * 100);
    }, [checkedItems]);
    
    const failedItems = useMemo(() => {
        return checklistItems
            .filter(item => !checkedItems[item.id])
            .map(item => item.text);
    }, [checkedItems]);

    const handleGetSuggestions = async () => {
        setLoadingSuggestions(true);
        setAiSuggestions(null);
        try {
            const result = await suggestBiosecurityImprovements({ failedItems });
            setAiSuggestions(result.suggestions);
        } catch (error) {
            console.error("Failed to get AI suggestions:", error);
            setAiSuggestions("Sorry, I couldn't generate suggestions at this time. Please try again later.");
        } finally {
            setLoadingSuggestions(false);
        }
    };
    
    const getScoreColor = (s: number) => {
        if (s < 50) return "bg-destructive";
        if (s < 80) return "bg-yellow-500";
        return "bg-green-600";
    }

    if(userLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    return (
        <>
            <PageHeader
                title="Biosecurity Hub"
                description="Assess your farm's biosecurity level and get AI-powered recommendations."
            />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                     {['Isolation', 'Traffic Control', 'Sanitation'].map(category => (
                        <Card key={category}>
                            <CardHeader>
                                <CardTitle>{category}</CardTitle>
                                <CardDescription>Practices to prevent diseases from entering and spreading on your farm.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {checklistItems.filter(item => item.category === category).map(item => (
                                    <div key={item.id} className="flex items-center space-x-3 rounded-md border p-4">
                                        <Checkbox
                                            id={item.id}
                                            checked={checkedItems[item.id] || false}
                                            onCheckedChange={(checked) => handleCheckChange(item.id, !!checked)}
                                        />
                                        <Label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {item.text}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                     ))}
                </div>
                <div className="lg:col-span-1 sticky top-24 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Biosecurity Score</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-6xl font-bold">{score}%</div>
                            <Progress value={score} className={`mt-4 h-3 ${getScoreColor(score)}`} />
                            <p className="text-sm text-muted-foreground mt-2">A score above 80% is recommended for optimal flock protection.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                <WandSparkles className="text-primary"/>
                                AI Improvement Plan
                            </CardTitle>
                             <CardDescription>Get a personalized plan to address security gaps.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={handleGetSuggestions} disabled={loadingSuggestions} className="w-full">
                                {loadingSuggestions ? <Loader2 className="mr-2 animate-spin" /> : <WandSparkles className="mr-2" />}
                                {loadingSuggestions ? 'Analyzing...' : 'Get AI Suggestions'}
                            </Button>
                            {aiSuggestions && (
                                <div className="mt-4 space-y-4">
                                    <Separator />
                                     <div 
                                        className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: aiSuggestions.replace(/\n/g, '<br />') }}
                                    />
                                </div>
                            )}
                             {failedItems.length > 0 && !aiSuggestions && !loadingSuggestions && (
                                 <div className="mt-4 text-center text-sm text-orange-600 flex items-center gap-2 p-2 bg-orange-500/10 rounded-md">
                                     <ShieldAlert className="size-8" />
                                     <span>You have {failedItems.length} unaddressed biosecurity risks. Click the button above to get a plan.</span>
                                 </div>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
