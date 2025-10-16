
// src/app/diagnose-health/_components/symptom-checker.tsx
"use client";

import { useState, useMemo, useRef, ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { diagnoseChickenHealth, type DiagnoseChickenHealthOutput } from '@/ai/flows/diagnose-chicken-health';
import { WandSparkles, Loader2, Upload, X, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language-provider';

const formSchema = z.object({
  symptoms: z.string().min(10, "Please provide a detailed description of symptoms."),
  flockAgeWeeks: z.coerce.number().int().min(0, "Age must be a non-negative number."),
  photoDataUri: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LikelihoodBadge = ({ likelihood }: { likelihood: 'High' | 'Medium' | 'Low' }) => {
    const config = {
        High: "bg-destructive/80 text-destructive-foreground",
        Medium: "bg-yellow-500/80 text-yellow-foreground",
        Low: "bg-green-600/80 text-green-foreground",
    };
    return <Badge className={config[likelihood]}>{likelihood}</Badge>
}

export function SymptomChecker() {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseChickenHealthOutput | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
      flockAgeWeeks: 0,
      photoDataUri: "",
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
          form.setError("photoDataUri", { message: "Image must be less than 4MB." });
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        form.setValue('photoDataUri', result, { shouldValidate: true });
        form.clearErrors("photoDataUri");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    form.setValue('photoDataUri', undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  async function onSubmit(values: FormValues) {
    setLoading(true);
    setDiagnosis(null);
    try {
      const result = await diagnoseChickenHealth(values);
      setDiagnosis(result);
    } catch (error) {
      console.error("Failed to get diagnosis:", error);
      // You could set an error state here to show in the UI
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 items-start">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>{t('diagnose_health.form_title')}</CardTitle>
                    <CardDescription>{t('diagnose_health.form_description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="symptoms"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('diagnose_health.symptoms_label')}</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} placeholder={t('diagnose_health.symptoms_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="flockAgeWeeks"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>{t('diagnose_health.age_label')}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 4" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="photoDataUri"
                                render={({ field }) => (
                                <FormItem>
                                     <FormLabel>{t('diagnose_health.photo_label')}</FormLabel>
                                     <FormControl>
                                         <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="mr-2"/>
                                            {t('diagnose_health.upload_button')}
                                         </Button>
                                     </FormControl>
                                     <Input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                                     <FormDescription className="text-xs">{t('diagnose_health.photo_description')}</FormDescription>
                                     <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                         {previewImage && (
                            <div className="relative w-full max-w-sm mx-auto">
                                <Image src={previewImage} alt="Preview" width={300} height={300} className="rounded-md object-contain" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                        {loading ? t('diagnose_health.analyzing_button') : t('diagnose_health.diagnose_button')}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle>{t('diagnose_health.results_title')}</CardTitle>
                    <CardDescription>{t('diagnose_health.results_description')}</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px]">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4">{t('diagnose_health.analyzing_message')}</p>
                         </div>
                    ) : diagnosis ? (
                        <div className="space-y-6 text-sm">
                             <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-300 [&>svg]:text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    This is an AI-generated diagnosis and not a substitute for professional veterinary advice. Always consult a qualified veterinarian for serious health concerns.
                                </AlertDescription>
                            </Alert>

                            <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">{t('diagnose_health.possible_diseases_title')}</h3>
                                <div className="space-y-4">
                                {diagnosis.possibleDiseases.map(disease => (
                                    <div key={disease.name} className="rounded-md border p-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">{disease.name}</h4>
                                            <LikelihoodBadge likelihood={disease.likelihood} />
                                        </div>
                                        <p className="text-muted-foreground mt-1">{disease.reasoning}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">{t('diagnose_health.recommended_actions_title')}</h3>
                                <p className="text-muted-foreground whitespace-pre-line">{diagnosis.recommendedActions}</p>
                            </div>
                             <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">{t('diagnose_health.preventative_measures_title')}</h3>
                                <p className="text-muted-foreground whitespace-pre-line">{diagnosis.preventativeMeasures}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                            <div className="space-y-2">
                                <WandSparkles className="mx-auto h-12 w-12" />
                                <p>{t('diagnose_health.results_placeholder')}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
