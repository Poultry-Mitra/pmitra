// src/app/setup-admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase/provider";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { AppIcon } from "@/app/icon";
import { Loader2, ShieldCheck } from "lucide-react";

const formSchema = z.object({
    fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SetupAdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "PoultryMitra Admin",
            email: "ipoultrymitra@gmail.com",
            password: "",
        },
    });

    async function onSubmit(values: FormValues) {
        if (!auth || !firestore) {
            toast({ title: "Error", description: "Firebase not initialized. Please try again later.", variant: "destructive" });
            return;
        }

        try {
            // Step 1: Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Step 2: Create user profile and admin role in Firestore within a batch write
            const batch = writeBatch(firestore);

            // Document in 'users' collection
            const userProfileRef = doc(firestore, "users", user.uid);
            const userProfile = {
                name: values.fullName,
                email: values.email,
                role: 'admin',
                planType: 'premium',
                dateJoined: new Date().toISOString(),
                aiQueriesCount: 0,
                lastQueryDate: "",
                state: "Default", // Add default values as these are required
                district: "Default"
            };
            batch.set(userProfileRef, userProfile);

            // Document in 'roles_admin' collection
            const adminRoleRef = doc(firestore, "roles_admin", user.uid);
            batch.set(adminRoleRef, { email: values.email, joinedAt: new Date().toISOString() });

            // Commit the batch write
            await batch.commit();

            toast({
                title: "Admin Account Created!",
                description: "You have been successfully registered as an admin. Redirecting...",
            });

            router.push('/admin/dashboard');

        } catch (error: any) {
            console.error("Admin setup failed:", error);
            let errorMessage = "An unknown error occurred during setup.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please login or use the main signup page if this is not an admin account.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "The password is too weak. Please use at least 6 characters.";
            }
            toast({
                title: "Admin Setup Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                     <ShieldCheck className="mx-auto size-10 text-primary" />
                    <CardTitle className="font-headline text-2xl">One-Time Admin Setup</CardTitle>
                    <CardDescription>Create the primary administrator account for PoultryMitra.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Admin's full name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Admin Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="admin@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                {isSubmitting ? 'Creating Admin Account...' : 'Create Admin Account'}
                            </Button>

                            <p className="pt-4 text-center text-sm text-muted-foreground">
                                Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Login here</Link>
                            </p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
