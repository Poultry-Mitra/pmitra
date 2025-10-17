// src/app/(app)/diagnose-health/_components/symptom-checker.tsx
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
import { WandSparkles, Loader2, Upload, X, AlertTriangle, Send, HeartPulse } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/app/icon-component';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';


const formSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom."),
  flockAgeWeeks: z.coerce.number().int().min(0, "Age must be a non-negative number."),
  photoDataUri: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const symptomCategories = {
    general: {
        title: "सामान्य और व्यवहार (General & Behavioral)",
        symptoms: ["सुस्ती/कमजोरी (Lethargy/Weakness)", "भूख न लगना (Loss of Appetite)", "प्यास बढ़ना (Increased Thirst)", "वजन न बढ़ना (Poor Growth)", "अचानक मृत्यु (Sudden Death)", "अलग-थलग रहना (Isolation)", "असामान्य आवाजें (Unusual Noises)"]
    },
    respiratory: {
        title: "श्वसन (Respiratory)",
        symptoms: ["खाँसी (Coughing)", "छींक (Sneezing)", "घरघराहट (Rattling/Gasping)", "नाक बहना (Nasal Discharge)", "चेहरे पर सूजन (Facial Swelling)", "आँखों से पानी (Watery Eyes)"]
    },
    digestive: {
        title: "पाचन और बीट (Digestive & Droppings)",
        symptoms: ["दस्त (Diarrhea)", "खूनी दस्त (Bloody Droppings)", "सफ़ेद दस्त (White/Chalky Droppings)", "हरा दस्त (Greenish Droppings)", "पानी जैसा दस्त (Watery Droppings)", "फूला हुआ पेट (Swollen Abdomen)", "वेंट का गंदा होना (Pasting of Vent)"]
    },
    neurological: {
        title: "तंत्रिका-सम्बंधित (Neurological)",
        symptoms: ["गर्दन मुड़ी होना (Twisted Neck/Torticollis)", "लंगड़ापन (Lameness)", "पक्षाघात (Paralysis of legs/wings)", "असंतुलित चाल (Staggering/Incoordination)", "कंपन (Tremors)"]
    },
    legs_joints: {
        title: "पैर और जोड़ (Legs & Joints)",
        symptoms: ["जोड़ों में सूजन (Swollen Joints)", "पैरों पर पपड़ी (Scaly Legs)", "पैर के तलवों में घाव (Footpad Lesions/Bumblefoot)", "चलने में कठिनाई (Difficulty Walking)"]
    },
    head_eyes: {
        title: "सिर और आँखें (Head & Eyes)",
        symptoms: ["कलगी और वॉटल्स का नीला पड़ना (Cyanosis of Comb/Wattles)", "कलगी पर सफेद धब्बे (White spots on Comb)", "आँखों में झाग (Foamy Eyes)", "आँखें बंद रखना (Closed Eyes)"]
    },
    skin_feathers: {
        title: "त्वचा और पंख (Skin & Feathers)",
        symptoms: ["पंख झड़ना (Feather Loss)", "पंख फूलना (Ruffled Feathers)", "त्वचा पर घाव/गांठें (Skin Lesions/Lumps)", "एक दूसरे को नोचना (Cannibalism)"]
    }
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
  
    const runLocalDiagnosis = (values: FormValues): DiagnoseChickenHealthOutput => {
        let disease = "हल्के लक्षण (Mild Symptoms)";
        let likelihood: "High" | "Medium" | "Low" = "Low";
        let reasoning = "यह लक्षण तनाव या हल्के संक्रमण के कारण हो सकते हैं। (These symptoms might be due to stress or a minor infection.)";
        let treatmentPlan = [{step: "इलेक्ट्रोलाइट्स दें (Give Electrolytes)", details: "तनाव कम करने के लिए पीने के पानी में इलेक्ट्रोलाइट्स मिलाएं। (Mix electrolytes in drinking water to reduce stress.)"}, {step: "आरामदायक वातावरण (Comfortable Environment)", details: "सुनिश्चित करें कि शेड सूखा, हवादार और सही तापमान पर हो। (Ensure the shed is dry, well-ventilated, and at the correct temperature.)"}];
        let preventativeMeasures = ["नियमित टीकाकरण और स्वच्छता बनाए रखें। (Maintain regular vaccination and hygiene.)", "संतुलित आहार प्रदान करें। (Provide a balanced diet.)"];
        let biharSpecificAdvice = "बिहार के मौसम में बदलाव के दौरान विशेष ध्यान दें, खासकर गर्मी और बरसात में। (Pay special attention during weather changes in Bihar, especially in summer and monsoon.)";

        const symptoms = values.symptoms;

        if (symptoms.includes("खूनी दस्त (Bloody Droppings)")) {
            disease = "कोक्सीडियोसिस (Coccidiosis)";
            likelihood = "High";
            reasoning = "मल में खून आना कोक्सीडियोसिस का एक प्रमुख लक्षण है, जो एक परजीवी संक्रमण है। (Bloody droppings are a primary symptom of Coccidiosis, a parasitic infection.)";
            treatmentPlan = [{step: "एम्प्रोलियम का प्रयोग करें (Use Amprolium)", details:"पशु चिकित्सक की सलाह के अनुसार पीने के पानी में एम्प्रोलियम मिलाएं। यह एक सामान्य और प्रभावी दवा है। (Administer Amprolium in drinking water as per veterinary advice. It's a common and effective medicine.)"}, {step: "बिस्तर बदलें (Change Litter)", details: "गीले बिस्तर को तुरंत हटा दें और नया, सूखा बिस्तर बिछाएं ताकि परजीवी का प्रसार रुक सके। (Immediately remove wet litter and replace it with fresh, dry litter to stop the spread of parasites.)"}];
            preventativeMeasures = ["बिस्तर को हमेशा सूखा रखें। (Keep the litter dry at all times.)", "कोक्सीडियोस्टैट युक्त स्टार्टर फ़ीड का उपयोग करें। (Use starter feed containing Coccidiostats.)"];
            biharSpecificAdvice = "एम्प्रोलियम या टॉल्ट्राज़ुरिल दवा बिहार की दवा दुकानों में आसानी से उपलब्ध है। (Amprolium or Toltrazuril medicine is easily available in Bihar's medicine shops.)";
        } else if (symptoms.includes("गर्दन मुड़ी होना (Twisted Neck/Torticollis)")) {
            disease = "रानीखेत (Newcastle Disease)";
            likelihood = "High";
            reasoning = "गर्दन का मुड़ना रानीखेत रोग का एक विशिष्ट तंत्रिका-संबंधी लक्षण है। (A twisted neck is a specific neurological symptom of Newcastle Disease.)";
            treatmentPlan = [{step: "तुरंत पशु चिकित्सक से मिलें (Consult a Vet Immediately)", details: "यह एक गंभीर वायरल बीमारी है और इसके लिए पेशेवर मदद की आवश्यकता है। (This is a serious viral disease and requires professional help.)"}, {step: "बीमार मुर्गियों को अलग करें (Isolate Sick Birds)", details: "संक्रमण को फैलने से रोकने के लिए प्रभावित पक्षियों को तुरंत स्वस्थ झुंड से अलग करें। (Isolate affected birds immediately from the healthy flock to prevent the spread of infection.)"}];
            preventativeMeasures = ["समय पर 'R2B' और 'LaSota' का टीकाकरण करवाएं। (Get 'R2B' and 'LaSota' vaccinations done on time.)", "फार्म पर बाहरी लोगों का प्रवेश प्रतिबंधित करें। (Restrict entry of outsiders to the farm.)"];
            biharSpecificAdvice = "बिहार में लासोटा वैक्सीन सरकारी पशुपालन केंद्रों पर उपलब्ध है। टीकाकरण कार्यक्रम का सख्ती से पालन करें। (LaSota vaccine is available at government animal husbandry centers in Bihar. Strictly follow the vaccination schedule.)";
        } else if (symptoms.some(s => ["खाँसी (Coughing)", "छींक (Sneezing)", "घरघराहट (Rattling/Gasping)"].includes(s))) {
            disease = "श्वसन संबंधी संक्रमण (CRD)";
            likelihood = "Medium";
            reasoning = "खांसी और छींक जैसे लक्षण क्रोनिक रेस्पिरेटरी डिजीज (CRD) का संकेत देते हैं। (Symptoms like coughing and sneezing indicate Chronic Respiratory Disease (CRD).)";
            treatmentPlan = [{step: "एंटीबायोटिक दें (Administer Antibiotics)", details: "पशु चिकित्सक की सलाह पर पानी में टायलोसिन या टेट्रासाइक्लिन जैसे एंटीबायोटिक्स दें। (Administer antibiotics like Tylosin or Tetracycline in water, on veterinary advice.)"}, {step: "वेंटिलेशन सुधारें (Improve Ventilation)", details: "शेड में ताजी हवा का प्रवाह सुनिश्चित करें ताकि अमोनिया गैस बाहर निकल सके। (Ensure fresh air flow in the shed to let out ammonia gas.)"}];
            preventativeMeasures = ["शेड में भीड़ कम करें। (Reduce crowding in the shed.)", "अमोनिया के स्तर को नियंत्रित करने के लिए बिस्तर का उचित प्रबंधन करें। (Properly manage litter to control ammonia levels.)"];
            biharSpecificAdvice = "सर्दियों और बरसात के मौसम में सीआरडी का खतरा बढ़ जाता है, इसलिए अतिरिक्त सावधानी बरतें। (The risk of CRD increases during winter and rainy seasons, so take extra precautions.)";
        }

        return {
            possibleDiseases: [{ name: disease, likelihood, reasoning }],
            treatmentPlan,
            preventativeMeasures,
            biharSpecificAdvice,
        };
    };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setDiagnosis(null);
    setChatMessages([]);
    try {
      // Attempt to get diagnosis from AI
      const result = await diagnoseChickenHealth({symptoms: values.symptoms.join(', '), flockAgeWeeks: values.flockAgeWeeks, photoDataUri: values.photoDataUri});
      setDiagnosis(result);
    } catch (error) {
      console.error("AI diagnosis failed, running local fallback:", error);
      // If AI fails, run the local diagnosis logic
      const localResult = runLocalDiagnosis(values);
      setDiagnosis(localResult);
    } finally {
        setChatMessages([{id: '0', text: "What other questions do you have about this diagnosis?", sender: 'ai'}]);
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
  
  const SymptomButton = ({ symptom }: { symptom: string }) => (
    <Button 
      key={symptom} 
      type="button" 
      variant={form.watch('symptoms').includes(symptom) ? "default" : "outline"} 
      onClick={() => handleSymptomToggle(symptom)}
      className="h-auto text-wrap"
    >
      {symptom}
    </Button>
  );


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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.values(symptomCategories).map(category => (
                                <Card key={category.title} className="flex-1">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">{category.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex flex-wrap gap-2">
                                            {category.symptoms.map(s => <SymptomButton key={s} symptom={s} />)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <FormField control={form.control} name="symptoms" render={() => <FormMessage />} />
                        
                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <FormField control={form.control} name="flockAgeWeeks" render={({ field }) => (
                                <FormItem><FormLabel>Flock Age (in weeks)</FormLabel><FormControl><Input type="number" placeholder="e.g. 4" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="photoDataUri" render={() => (
                                <FormItem>
                                     <FormLabel>Upload Photo (Optional)</FormLabel>
                                     <FormControl><Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2"/>Upload Image</Button></FormControl>
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
                        <Button type="submit" disabled={loading} className="w-full" size="lg">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartPulse className="mr-2 h-4 w-4" />}
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
                <CardContent className="min-h-[600px]">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4">Our AI is analyzing the symptoms...</p>
                         </div>
                    ) : diagnosis ? (
                        <div className="space-y-4 text-sm">
                             <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-300 [&>svg]:text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>यह एक AI-जनित निदान है। गंभीर स्वास्थ्य संबंधी चिंताओं के लिए हमेशा एक योग्य पशु चिकित्सक से सलाह लें।</AlertDescription>
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
                                <h3 className="font-headline font-semibold text-foreground mb-2">Recommended Actions</h3>
                                <div className="space-y-2">
                                {diagnosis.treatmentPlan.map((item, index) => (
                                    <div key={index} className="p-2 rounded-md bg-secondary/50">
                                        <p className="font-semibold">{index + 1}. {item.step}</p>
                                        <p className="text-muted-foreground text-xs pl-4">{item.details}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">Preventative Measures</h3>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                                {diagnosis.preventativeMeasures.map((measure, index) => (
                                    <li key={index}>{measure}</li>
                                ))}
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-headline font-semibold text-foreground mb-2">बिहार के लिए विशेष सलाह</h3>
                                <p className="text-muted-foreground text-xs italic">{diagnosis.biharSpecificAdvice}</p>
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
