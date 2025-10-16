
// src/app/(app)/diagnose-health/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  WandSparkles,
  FileQuestion,
  Heart,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { diagnoseChickenHealth, type DiagnoseChickenHealthOutput } from '@/ai/flows/diagnose-chicken-health';
import { useLanguage } from '@/components/language-provider';
import { useAppUser } from '@/app/app-provider';
import { Label } from '@/components/ui/label';

const symptomsData = [
    {
        category: 'respiratory',
        symptoms: [
            { id: 'gasping', text: { en: 'Gasping, coughing, or sneezing', hi: 'हंँफना, खांसना या छींकना' } },
            { id: 'nasal_discharge', text: { en: 'Nasal discharge', hi: 'नाक से स्राव' } },
            { id: 'swollen_face', text: { en: 'Swollen face or head', hi: 'चेहरा या सिर सूजा हुआ' } },
            { id: 'rattling_sounds', text: { en: 'Rattling or gurgling sounds from the throat', hi: 'गले से घरघराहट या खरख़राहट की आवाज़' } },
            { id: 'bluish_comb', text: { en: 'Bluish or purplish discoloration of comb and wattles', hi: 'कंघा और गलफड़ें नीले-बैंगनी होना' } },
            { id: 'foul_odor_swelling', text: { en: 'Swelling of face with foul odor', hi: 'चेहरे पर दुर्गंध के साथ सूजन' } },
        ]
    },
    {
        category: 'digestive',
        symptoms: [
            { id: 'diarrhea', text: { en: 'Diarrhea (especially bloody or greenish)', hi: 'दस्त (विशेषकर खूनी या हरा)' } },
            { id: 'loss_of_appetite', text: { en: 'Loss of appetite', hi: 'भूख न लगना' } },
            { id: 'pasted_vent', text: { en: 'Pasted vent', hi: 'वेंट पर मल जमना' } },
            { id: 'sudden_mortality', text: { en: 'Sudden, high mortality in the flock', hi: 'झुंड में अचानक, अधिक मृत्यु' } },
        ]
    },
    {
        category: 'behavioral',
        symptoms: [
            { id: 'lethargy', text: { en: 'Lethargy, depression, or huddling', hi: 'सुस्ती, उदासी या झुंड में रहना' } },
            { id: 'paralysis', text: { en: 'Paralysis or limping', hi: 'लकवा या लंगड़ापन' } },
            { id: 'twisted_neck', text: { en: 'Twisted neck (Torticollis)', hi: 'गर्दन मुड़ना (टॉरटीकोलिस)' } },
            { id: 'swollen_belly', text: { en: 'Watery, swollen belly (Ascites)', hi: 'पेट में पानी भरना' } },
            { id: 'droopy_wings', text: { en: 'Droopy or weak wings', hi: 'पंखों का लटकना या कमजोर दिखना' } },
            { id: 'warts_lesions', text: { en: 'Warts or lesions on comb and wattles', hi: 'कंघा और गलफड़ों पर मस्से या घाव' } },
            { id: 'joint_swelling', text: { en: 'Swelling in joints and lameness', hi: 'जोड़ों में सूजन और लंगड़ापन' } },
        ]
    }
];


export function DiseaseSymptomChecker() {
  const { t, language } = useLanguage();
  const { user } = useAppUser();
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseChickenHealthOutput | null>(null);
  const [age, setAge] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSymptomChange = (id: string, checked: boolean) => {
    setSelectedSymptoms(prev => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async () => {
    const usageCount = parseInt(localStorage.getItem('diseaseCheckerUsage') || '0');
    if (!user && usageCount >= 1) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    setDiagnosis(null);

    const symptomTexts = Object.keys(selectedSymptoms)
        .filter(key => selectedSymptoms[key])
        .map(key => {
            for (const category of symptomsData) {
                const symptom = category.symptoms.find(s => s.id === key);
                if (symptom) return symptom.text[language];
            }
            return '';
        })
        .filter(Boolean)
        .join(', ');

    if (!symptomTexts) {
        setLoading(false);
        // Maybe show a toast or message to select symptoms
        return;
    }
    
    try {
      const result = await diagnoseChickenHealth({ symptoms: symptomTexts, flockAgeWeeks: age });
      setDiagnosis(result);
      if (!user) {
        localStorage.setItem('diseaseCheckerUsage', (usageCount + 1).toString());
      }
    } catch (error) {
      console.error('Diagnosis failed:', error);
      // You could set an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle>{t('diagnose_health.form_title')}</CardTitle>
            <CardDescription>{t('diagnose_health.form_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>{t('diagnose_health.age_label')}</Label>
                <Select onValueChange={(value) => setAge(parseInt(value))} defaultValue='0'>
                    <SelectTrigger>
                        <SelectValue placeholder="Select bird's age"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2">0 - 2 Weeks (Chicks)</SelectItem>
                        <SelectItem value="4">3 - 5 Weeks (Growers)</SelectItem>
                        <SelectItem value="6">5+ Weeks (Adults)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {symptomsData.map(category => (
                <div key={category.category} className="space-y-2">
                     <h4 className="font-medium text-sm">{language === 'hi' ? {respiratory: 'श्वसन संबंधी लक्षण', digestive: 'पाचन संबंधी लक्षण', behavioral: 'व्यवहार और शारीरिक लक्षण'}[category.category] : category.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {category.symptoms.map(symptom => (
                            <div key={symptom.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={symptom.id}
                                    checked={selectedSymptoms[symptom.id] || false}
                                    onCheckedChange={(checked) => handleSymptomChange(symptom.id, !!checked)}
                                />
                                <label htmlFor={symptom.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {symptom.text[language]}
                                </label>
                            </div>
                        ))}
                     </div>
                </div>
            ))}

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 animate-spin" /> : <WandSparkles className="mr-2" />}
              {loading ? t('diagnose_health.analyzing_button') : t('diagnose_health.diagnose_button')}
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col sticky top-24">
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
                <p>आपके निदान के परिणाम यहां दिखाई देंगे।</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500"/>
                Login to Continue
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have used your free diagnosis. Please login or create an account to continue using this tool without limits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
                <Link href="/login">Login / Sign Up</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
