
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase/provider";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AppIcon } from "@/app/icon";
import { Loader2 } from "lucide-react";
import indianStates from "@/lib/indian-states-districts.json";

const formSchema = z.object({
    fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    mobileNumber: z.string().optional(),
    state: z.string().min(1, { message: "Please select a state." }),
    district: z.string().min(1, { message: "Please select a district." }),
    pinCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DetailedSignupPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const initialRole = (params.role as string) || "farmer";
    const [districts, setDistricts] = useState<string[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            mobileNumber: "",
            state: "",
            district: "",
            pinCode: "",
        },
    });

    const selectedState = form.watch("state");

    useEffect(() => {
        if (selectedState) {
            const stateData = indianStates.states.find(s => s.state === selectedState);
            setDistricts(stateData ? stateData.districts : []);
            form.setValue("district", ""); // Reset district when state changes
        } else {
            setDistricts([]);
        }
    }, [selectedState, form]);

    async function onSubmit(values: FormValues) {
        if (!auth || !firestore) {
            toast({ title: "Error", description: "Firebase not initialized. Please try again later.", variant: "destructive" });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Special handling for the admin email
            const isAdminEmail = values.email.toLowerCase() === 'ipoultrymitra@gmail.com';
            const finalRole = isAdminEmail ? 'admin' : initialRole;
            const finalPlan = isAdminEmail ? 'premium' : 'free';

            const userProfile = {
                name: values.fullName,
                email: values.email,
                role: finalRole,
                mobileNumber: values.mobileNumber || "",
                state: values.state,
                district: values.district,
                pinCode: values.pinCode || "",
                planType: finalPlan,
                aiQueriesCount: 0,
                lastQueryDate: "",
                dateJoined: new Date().toISOString(),
                ...(finalRole === 'dealer' && { 
                    uniqueDealerCode: `DL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    connectedFarmers: [],
                }),
                ...(finalRole === 'farmer' && {
                    connectedDealers: [],
                }),
            };

            await setDoc(doc(firestore, "users", user.uid), userProfile);

            toast({
                title: "Account Created!",
                description: "You have been successfully registered. Redirecting to dashboard...",
            });

            const redirectPath = {
                admin: '/admin/dashboard',
                dealer: '/dealer/dashboard',
                farmer: '/dashboard',
            }[finalRole];

            router.push(redirectPath);

        } catch (error: any) {
            console.error("Signup failed:", error);
            let errorMessage = "An unknown error occurred during signup.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please login or use a different email.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "The password is too weak. Please use at least 6 characters.";
            }
            toast({
                title: "Signup Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-xl">
                <CardHeader className="text-center">
                     <AppIcon className="mx-auto size-10 text-primary" />
                    <CardTitle className="font-headline text-2xl">Create Your {initialRole === 'farmer' ? 'Farmer' : 'Dealer'} Account</CardTitle>
                    <CardDescription>Fill in your details to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField control={form.control} name="state" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl>
                                            <SelectContent>{indianStates.states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="district" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>District</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select your district" /></SelectTrigger></FormControl>
                                            <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input type="tel" placeholder="e.g. 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="pinCode" render={({ field }) => (
                                    <FormItem><FormLabel>PIN Code (Optional)</FormLabel><FormControl><Input placeholder="e.g. 411001" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Login here</Link>
                            </p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
