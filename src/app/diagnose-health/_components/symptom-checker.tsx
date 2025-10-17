
// src/app/diagnose-health/_components/symptom-checker.tsx
"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { diagnoseChickenHealth, type DiagnoseChickenHealthOutput } from '@/ai/flows/diagnose-chicken-health';
import { siteExpert } from '@/ai/flows/site-expert';
import { WandSparkles, Loader2, Upload, X, AlertTriangle, Send } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/app/icon-component';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom."),
  flockAgeWeeks: z.coerce.number().int().min(0, "Age must be a non-negative number."),
  photoDataUri: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const symptomsByCategory = {
    general: ["सुस्त और कमजोर", "भूख कम लगना", "प्यास बढ़ना", "वजन घटना", "अचानक मौत"],
    respiratory: ["खाँसी", "छींकना", "नाक बहना", "सांस लेने में कठिनाई", "मुंह खोलकर सांस लेना", "सांस लेते समय घरघराहट"],
    digestive: ["ढीला मल (दस्त)", "खूनी दस्त", "हरा दस्त", "सफ़ेद दस्त", "बिना पचा हुआ चारा बीट में"],
    neurological: ["पक्षाघात (लकवा)", "गर्दन मुड़ना", "लड़खड़ाना", "चक्कर काटना", "असंतुलित चाल"],
    physical: ["पंख झड़ना", "शरीर पर गांठें", "सूजे हुए जोड़", "अंडे का उत्पादन कम होना", "पतले छिलके वाले अंडे"],
    head_neck_eyes: ["आंखों में सूजन", "आंखों से पानी आना", "चेहरे पर सूजन", "कलगी और गलमुच्छे का नीला पड़ना", "गर्दन में सूजन"],
    skin_feathers: ["पंख अस्त-व्यस्त होना", "त्वचा पर घाव", "पंखों के पास कीड़े", "त्वचा का पीला पड़ना"],
};


const LikelihoodBadge = ({ likelihood }: { likelihood: 'High' | 'Medium' | 'Low' }) => {
    const config = {
        High: "bg-destructive/80 text-destructive-foreground",
        Medium: "bg-yellow-500/80 text-yellow-foreground",
        Low: "bg-green-600/80 text-green-foreground",
    };
    return <Badge className={cn("capitalize", config[likelihood])}>{likelihood}</Badge>
}

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export function SymptomChecker() {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseChickenHealthOutput | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: [],
      flockAgeWeeks: 4,
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

  const handleSymptomToggle = (symptom: string) => {
    const currentSymptoms = form.getValues('symptoms');
    const newSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];
    form.setValue('symptoms', newSymptoms, { shouldValidate: true });
  };
  

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setDiagnosis(null);
    setChatMessages([]);
    try {
      const result = await diagnoseChickenHealth({symptoms: values.symptoms.join(', '), flockAgeWeeks: values.flockAgeWeeks, photoDataUri: values.photoDataUri});
      setDiagnosis(result);
      setChatMessages([{id: '0', text: "What other questions do you have about this diagnosis?", sender: 'ai'}]);
    } catch (error) {
      console.error("Failed to get diagnosis:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage: Message = { id: Date.now().toString(), text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    const context = `The user has received the following diagnosis: ${JSON.stringify(diagnosis)}. Now they are asking: ${chatInput}`;

    try {
        const result = await siteExpert({ query: context });
        const aiMessage: Message = { id: (Date.now() + 1).toString(), text: result.answer, sender: 'ai' };
        setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I'm having trouble responding right now. Please try again.",
            sender: 'ai',
        };
        setChatMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 items-start">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Symptom Checker</CardTitle>
                    <CardDescription>Select all observed symptoms and upload a photo for the most accurate AI diagnosis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {Object.entries(symptomsByCategory).map(([category, symptoms]) => (
                                <Card key={category} className="p-4">
                                    <h4 className="font-medium mb-3 capitalize">{category.replace(/_/g, ' ')} Symptoms</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {symptoms.map(symptom => (
                                            <Button key={symptom} type="button" variant={form.watch('symptoms').includes(symptom) ? "default" : "outline"} size="sm" className="h-auto py-1 px-3 text-sm" onClick={() => handleSymptomToggle(symptom)}>{symptom}</Button>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <FormField control={form.control} name="symptoms" render={() => <FormMessage />} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <FormField control={form.control} name="flockAgeWeeks" render={({ field }) => (
                                <FormItem><FormLabel>Flock Age (in weeks)</FormLabel><FormControl><Input type="number" placeholder="e.g. 4" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="photoDataUri" render={() => (
                                <FormItem>
                                     <FormLabel>Upload Photo (Optional)</FormLabel>
                                     <FormControl><Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2"/>Upload Image</Button></FormControl>
                                     <Input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                                     <FormDescription className="text-xs">A photo of the sick bird or its droppings can improve diagnosis.</FormDescription>
                                     <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                         {previewImage && (
                            <div className="relative w-full max-w-sm mx-auto">
                                <Image src={previewImage} alt="Preview" width={300} height={300} className="rounded-md object-contain" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage}><X className="h-4 w-4" /></Button>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full !mt-8">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                            {loading ? "Analyzing..." : "Get AI Diagnosis"}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle>AI Diagnosis Results</CardTitle>
                    <CardDescription>Based on the information provided. Not a substitute for professional veterinary advice.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px]">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4">Our AI is analyzing the symptoms...</p>
                         </div>
                    ) : diagnosis ? (
                        <div className="space-y-4 text-sm">
                             <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-300 [&>svg]:text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>यह एआई-जनित निदान है। गंभीर स्वास्थ्य संबंधी चिंताओं के लिए हमेशा एक योग्य पशु चिकित्सक से सलाह लें।</AlertDescription>
                            </Alert>

                            <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">Possible Diseases</h3>
                                <div className="space-y-3">
                                {diagnosis.possibleDiseases.map(disease => (
                                    <div key={disease.name} className="rounded-md border p-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">{disease.name}</h4>
                                            <LikelihoodBadge likelihood={disease.likelihood} />
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-xs">{disease.reasoning}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">Treatment Plan</h3>
                                <ol className="list-decimal list-inside space-y-2 text-xs">
                                  {diagnosis.treatmentPlan.map((step, index) => (
                                    <li key={index}>
                                        <strong className="font-medium">{step.step}:</strong>
                                        <p className="pl-4 text-muted-foreground">{step.details}</p>
                                    </li>
                                  ))}
                                </ol>
                            </div>
                             <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">Preventative Measures</h3>
                                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                    {diagnosis.preventativeMeasures.map((measure, index) => <li key={index}>{measure}</li>)}
                                </ul>
                            </div>
                            <div className="rounded-md border bg-blue-500/10 border-blue-500/30 p-3">
                                <h3 className="font-headline font-semibold text-blue-800 dark:text-blue-300 mb-2">बिहार के लिए विशेष सलाह</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400">{diagnosis.biharSpecificAdvice}</p>
                            </div>

                            <Separator />

                            {/* Chat Section */}
                            <div className="space-y-2">
                                <h3 className="font-headline font-semibold text-foreground">Ask a Follow-up Question</h3>
                                <ScrollArea className="h-40 w-full rounded-md border p-3" ref={scrollAreaRef}>
                                    <div className="space-y-4">
                                    {chatMessages.map(msg => (
                                        <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                                            {msg.sender === 'ai' && <Avatar className="size-6"><AppIcon className="text-primary"/></Avatar>}
                                            <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-xs", msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isChatLoading && (
                                        <div className="flex items-end gap-2 justify-start">
                                             <Avatar className="size-6"><AppIcon className="text-primary"/></Avatar>
                                            <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-secondary">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0.2s]"></span>
                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0.4s]"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </ScrollArea>
                                <form onSubmit={handleChatSubmit} className="flex gap-2">
                                    <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your question..." disabled={isChatLoading} />
                                    <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}><Send className="size-4" /></Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                            <div className="space-y-2">
                                <WandSparkles className="mx-auto h-12 w-12" />
                                <p>Your diagnosis results will appear here.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
