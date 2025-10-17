// src/app/(app)/diagnose-health/report/[reportId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { DiagnosisRecord } from '@/lib/types';
import { Loader2, AlertTriangle, ShieldCheck, Pill, Droplet, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/app/(app)/diagnose-health/_components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import Image from 'next/image';

const LikelihoodBadge = ({ likelihood }: { likelihood: 'High' | 'Medium' | 'Low' }) => {
    const config = {
        High: "bg-destructive/80 text-destructive-foreground",
        Medium: "bg-yellow-500/80 text-yellow-foreground",
        Low: "bg-green-600/80 text-green-foreground",
    };
    return <Badge className={cn("capitalize", config[likelihood])}>{likelihood}</Badge>
}

const TreatmentStepIcon = ({ stepTitle }: { stepTitle: string }) => {
    const title = stepTitle.toLowerCase();
    if (title.includes('isolate') || title.includes('separate')) return <ShieldCheck className="text-orange-500" />;
    if (title.includes('medication') || title.includes('antibiotic') || title.includes('treat')) return <Pill className="text-red-500" />;
    if (title.includes('water') || title.includes('feed') || title.includes('vitamin')) return <Droplet className="text-blue-500" />;
    return <Stethoscope className="text-gray-500" />;
}

export default function DiagnosisReportPage() {
    const params = useParams();
    const reportId = params.reportId as string;
    const firestore = useFirestore();

    const diagnosisRef = useMemoFirebase(() => 
        firestore && reportId ? doc(firestore, 'diagnoses', reportId) : null, 
    [firestore, reportId]);
    
    const { data: report, isLoading, error } = useDoc<DiagnosisRecord>(diagnosisRef);

    if (isLoading) {
        return (
            <div className="container max-w-3xl py-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Diagnosis Report...</p>
            </div>
        );
    }
    
    if (error || !report) {
         return (
            <div className="container max-w-3xl py-12 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h1 className="mt-4 text-2xl font-bold">Report Not Found</h1>
                <p className="mt-2 text-muted-foreground">The requested diagnosis report could not be found or you may not have permission to view it.</p>
            </div>
        );
    }
    
    const { input, output, createdAt } = report;
    const diagnosisDate = createdAt ? format(createdAt.toDate(), 'MMMM dd, yyyy') : 'N/A';

    return (
        <div className="container max-w-4xl py-12">
            <PageHeader
                title="AI Health Diagnosis Report"
                description={`Generated on ${diagnosisDate}`}
            />
            
            <div className="mt-8 space-y-8">
                <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-300 [&>svg]:text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>This is an AI-generated diagnosis. Always consult a qualified veterinarian for serious health concerns.</AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Symptoms & Information Provided</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                             <p><strong className="font-medium">Flock Age:</strong> {input.flockAgeDays} days</p>
                             <p className="mt-2"><strong className="font-medium">Observed Symptoms:</strong></p>
                             <p className="text-muted-foreground">{input.symptoms}</p>
                        </div>
                        {input.photoDataUri && (
                            <div>
                                <p className="font-medium mb-2">Photo Evidence:</p>
                                <Image src={input.photoDataUri} alt="Evidence" width={300} height={300} className="rounded-md border" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Possible Diseases</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {output.possibleDiseases.map(disease => (
                            <div key={disease.name} className="rounded-md border p-4">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-lg">{disease.name}</h4>
                                    <LikelihoodBadge likelihood={disease.likelihood} />
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">{disease.reasoning}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Recommended Treatment Plan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                    {output.treatmentPlan.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 pt-1"><TreatmentStepIcon stepTitle={step.step}/></div>
                            <div>
                                <strong className="font-semibold">{step.step}</strong>
                                <p className="text-muted-foreground text-sm">{step.details}</p>
                            </div>
                        </div>
                    ))}
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader><CardTitle>Long-Term Preventative Measures</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            {output.preventativeMeasures.map((measure, index) => <li key={index}>{measure}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                
                <div className="rounded-md border bg-blue-500/10 border-blue-500/30 p-4">
                    <h3 className="font-headline font-semibold text-blue-800 dark:text-blue-300 mb-2">बिहार के लिए विशेष सलाह</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">{output.biharSpecificAdvice}</p>
                </div>
            </div>
        </div>
    );
}
