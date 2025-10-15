
// src/app/(app)/diagnose-health/page.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../_components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, WandSparkles, Upload, FileQuestion, ShieldAlert, Heart, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { diagnoseChickenHealth, type DiagnoseChickenHealthOutput } from '@/ai/flows/diagnose-chicken-health';
import { useLanguage } from '@/components/language-provider';

const formSchema = z.object({
  symptoms: z.string().min(20, 'Please provide a detailed description of the symptoms (at least 20 characters).'),
  flockAgeWeeks: z.coerce.number().int().min(0, 'Flock age must be a non-negative number.'),
  photo: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiagnoseHealthPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseChickenHealthOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
      flockAgeWeeks: 0,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setDiagnosis(null);
    try {
      let photoDataUri: string | undefined = undefined;
      if (values.photo) {
        photoDataUri = await fileToBase64(values.photo);
      }
      const result = await diagnoseChickenHealth({ ...values, photoDataUri });
      setDiagnosis(result);
    } catch (error) {
      console.error('Diagnosis failed:', error);
      // You could set an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title={t('diagnose_health.title')}
        description={t('diagnose_health.description')}
      />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                <FormField
                  control={form.control}
                  name="flockAgeWeeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('diagnose_health.age_label')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>{t('diagnose_health.photo_label')}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {preview && <img src={preview} alt="Preview" className="h-20 w-20 rounded-md object-cover" />}
                      <Button asChild variant="outline" className="relative">
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Upload className="mr-2" /> {t('diagnose_health.upload_button')}
                          <input id="photo-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </label>
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>{t('diagnose_health.photo_description')}</FormDescription>
                </FormItem>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 animate-spin" /> : <WandSparkles className="mr-2" />}
                  {loading ? t('diagnose_health.analyzing_button') : t('diagnose_health.diagnose_button')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WandSparkles className="text-primary" /> {t('diagnose_health.results_title')}
            </CardTitle>
            <CardDescription>{t('diagnose_health.results_description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">{t('diagnose_health.analyzing_message')}</p>
                </div>
              </div>
            ) : diagnosis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 font-headline text-lg font-semibold flex items-center gap-2"><FileQuestion/> {t('diagnose_health.possible_diseases_title')}</h3>
                  <div className="space-y-4">
                    {diagnosis.possibleDiseases.map((disease, i) => (
                      <Alert key={i} variant={disease.likelihood === 'High' ? 'destructive' : 'default'}>
                        <AlertTitle className="flex justify-between items-center">
                          {disease.name}
                          <Badge variant={disease.likelihood === 'High' ? 'destructive' : 'secondary'}>{disease.likelihood} {t('diagnose_health.likelihood')}</Badge>
                        </AlertTitle>
                        <AlertDescription>{disease.reasoning}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 font-headline text-lg font-semibold flex items-center gap-2"><Heart/> {t('diagnose_health.recommended_actions_title')}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{diagnosis.recommendedActions}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 font-headline text-lg font-semibold flex items-center gap-2"><Activity/> {t('diagnose_health.preventative_measures_title')}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{diagnosis.preventativeMeasures}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <p>{t('diagnose_health.results_placeholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
