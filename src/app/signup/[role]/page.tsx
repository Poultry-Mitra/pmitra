
'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { GoogleAuthProvider, signInWithPopup, type User as FirebaseAuthUser, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, limit, deleteDoc } from "firebase/firestore";
import { AppIcon } from "@/app/icon-component";
import { Loader2 } from "lucide-react";
import indianStates from "@/lib/indian-states-districts.json";
import { Separator } from "@/components/ui/separator";
import type { Invitation } from "@/lib/types";

const formSchema = z.object({
    fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
    mobileNumber: z.string().optional(),
    state: z.string().min(1, { message: "Please select a state." }),
    district: z.string().min(1, { message: "Please select a district." }),
    pinCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.999,35.596,44,30.165,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    )
}

export default function DetailedSignupPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const [districts, setDistricts] = useState<string[]>([]);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [authProvider, setAuthProvider] = useState<'email' | 'google'>('email');
    const [googleUser, setGoogleUser] = useState<FirebaseAuthUser | null>(null);
    const [invitation, setInvitation] = useState<(Invitation & { id: string }) | null>(null);

    const initialRole = invitation?.role || (params.role as string) || "farmer";

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

    // Check for invitation token
    useEffect(() => {
        const token = searchParams.get('token');
        if (token && firestore) {
            const invitationsRef = collection(firestore, "invitations");
            const q = query(invitationsRef, where("token", "==", token), limit(1));
            getDocs(q).then(snapshot => {
                if (!snapshot.empty) {
                    const invDoc = snapshot.docs[0];
                    const invData = { id: invDoc.id, ...invDoc.data() } as Invitation & { id: string };
                    setInvitation(invData);
                    form.reset({
                        fullName: invData.name,
                        email: invData.email,
                    });
                }
            });
        }
    }, [searchParams, firestore, form]);

    const selectedState = form.watch("state");

    useEffect(() => {
        if (selectedState) {
            const stateData = indianStates.states.find(s => s.state === selectedState);
            setDistricts(stateData ? stateData.districts : []);
            form.setValue("district", "");
        } else {
            setDistricts([]);
        }
    }, [selectedState, form]);
    
    async function handleFinalUserCreation(userId: string, values: FormValues) {
        if (!firestore) return;
        const userDocRef = doc(firestore, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            toast({ title: "Account Exists", description: "This email is already registered. Please log in.", variant: "destructive" });
            if (auth?.currentUser) await auth.signOut();
            router.push('/login');
            return;
        }

        const isAdminEmail = values.email.toLowerCase() === 'ipoultrymitra@gmail.com';
        const finalRole = invitation?.role || (isAdminEmail ? 'admin' : initialRole);
        const finalStatus = invitation ? 'Active' : (isAdminEmail ? 'Active' : 'Pending');

        const userProfile = {
            name: values.fullName,
            email: values.email,
            role: finalRole,
            status: finalStatus,
            mobileNumber: values.mobileNumber || "",
            state: values.state,
            district: values.district,
            pinCode: values.pinCode || "",
            planType: invitation?.planType || (isAdminEmail ? 'premium' : 'free'),
            aiQueriesCount: 0,
            lastQueryDate: "",
            dateJoined: new Date().toISOString(),
            ...(finalRole === 'dealer' && { uniqueDealerCode: `DL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, connectedFarmers: [] }),
            ...(finalRole === 'farmer' && { connectedDealers: [] }),
        };

        await setDoc(userDocRef, userProfile);
        
        // If it was an invitation, delete it
        if (invitation) {
            await deleteDoc(doc(firestore, 'invitations', invitation.id));
        }
        
        toast({
            title: "Account Created!",
            description: finalStatus === 'Active' ? "Your account is active. Redirecting to login." : "Your account is pending approval. You will be notified once active.",
        });
        
        if (auth?.currentUser) await auth.signOut();
        router.push('/login');
    }

    async function onSubmit(values: FormValues) {
        if (!auth || !firestore) {
            toast({ title: "Error", description: "Firebase not initialized.", variant: "destructive" });
            return;
        }

        try {
            if (authProvider === 'google' && googleUser) {
                await handleFinalUserCreation(googleUser.uid, values);
            } else {
                if (!values.password) {
                    form.setError('password', { message: 'Password is required for email signup.' });
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                await handleFinalUserCreation(userCredential.user.uid, values);
            }
        } catch (error: any) {
            console.error("Signup failed:", error);
            if (error.code === 'auth/email-already-in-use') {
                form.setError('email', { type: 'manual', message: 'This email is already registered. Please login.' });
            } else {
                toast({ title: "Signup Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
            }
        }
    }
    
    async function handleGoogleSignUp() {
        if (!auth) return;
        setIsGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            if (firestore) {
                const userDocRef = doc(firestore, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    toast({ title: "Account Exists", description: "You already have an account. Please log in.", variant: "destructive" });
                    await auth.signOut();
                    router.push('/login');
                    return;
                }
            }
            
            form.reset({
                ...form.getValues(),
                fullName: user.displayName || "",
                email: user.email || "",
                password: "",
            });
            setAuthProvider('google');
            setGoogleUser(user);

        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                console.error("Google sign up error:", error);
                toast({ title: "Google Sign-Up Failed", description: "Could not sign up with Google.", variant: "destructive" });
            }
        } finally {
            setIsGoogleLoading(false);
        }
    }

    const isSubmitting = form.formState.isSubmitting || isGoogleLoading;

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-xl">
                <CardHeader className="text-center">
                     <AppIcon className="mx-auto size-10 text-primary" />
                    <CardTitle className="font-headline text-2xl capitalize">Create Your {initialRole} Account</CardTitle>
                    <CardDescription>{invitation ? `Accepting invitation for ${invitation.email}` : "Fill in your details or use Google to get started."}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!invitation && authProvider === 'email' && (
                        <>
                            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isSubmitting}>
                                {isGoogleLoading ? <Loader2 className="mr-2 animate-spin" /> : <GoogleIcon />}
                                Continue with Google
                            </Button>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                                </div>
                            </div>
                        </>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} disabled={authProvider === 'google' || !!invitation} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                            {authProvider === 'email' && (
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                            
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
                                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
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
