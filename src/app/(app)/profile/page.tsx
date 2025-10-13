// src/app/(app)/profile/page.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useAuth } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { Loader2, Save, KeyRound, Edit } from 'lucide-react';
import type { User as AppUser } from '@/lib/types';
import { useLanguage } from '@/components/language-provider';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  mobileNumber: z.string().optional(),
  pinCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
    const { t } = useLanguage();
    const { user: firebaseUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [user, setUser] = useState<AppUser | null>(null);
    const [isPasswordResetting, setIsPasswordResetting] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            mobileNumber: "",
            pinCode: "",
        },
    });

    useEffect(() => {
        if (firebaseUser && firestore) {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            getDoc(userDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data() as AppUser;
                    setUser(userData);
                    form.reset({
                        name: userData.name || '',
                        mobileNumber: userData.mobileNumber || '',
                        pinCode: userData.pinCode || '',
                    });
                     // Load avatar from localStorage
                    const storedAvatar = localStorage.getItem(`profile_pic_${firebaseUser.uid}`);
                    if (storedAvatar) {
                        setAvatarSrc(storedAvatar);
                    }
                }
            });
        }
    }, [firebaseUser, firestore, form]);


    async function onSubmit(values: FormValues) {
        if (!firestore || !firebaseUser) {
            toast({ title: t('messages.error'), description: t('messages.must_be_logged_in'), variant: "destructive" });
            return;
        }

        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const updatedData = {
            name: values.name,
            mobileNumber: values.mobileNumber,
            pinCode: values.pinCode
        };

        try {
            await updateDoc(userDocRef, updatedData);
            toast({ title: t('profile.update_success_title'), description: t('profile.update_success_desc') });
        } catch (error) {
             const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    }
    
    const handlePasswordReset = async () => {
        if (!auth || !firebaseUser?.email) {
            toast({ title: "Error", description: "Could not send reset email. User not found.", variant: "destructive" });
            return;
        }
        setIsPasswordResetting(true);
        try {
            await sendPasswordResetEmail(auth, firebaseUser.email);
            toast({
                title: "Password Reset Email Sent",
                description: "Please check your inbox to reset your password.",
            });
        } catch (error) {
            console.error("Password reset error:", error);
            toast({ title: "Error", description: "Failed to send password reset email.", variant: "destructive" });
        } finally {
            setIsPasswordResetting(false);
        }
    };
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && firebaseUser) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                localStorage.setItem(`profile_pic_${firebaseUser.uid}`, dataUrl);
                setAvatarSrc(dataUrl);
                toast({ title: "Profile Picture Updated", description: "Your new picture has been saved locally." });
            };
            reader.readAsDataURL(file);
        }
    };


    if (isUserLoading || !user) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <>
            <PageHeader title={t('profile.title')} description={t('profile.description')} />
            <div className="mt-8 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-3">
                 <div className="lg:col-span-1">
                     <Card>
                        <CardHeader className="items-center">
                             <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                                    <AvatarImage src={avatarSrc || ''} alt={user.name} />
                                    <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-1 right-1 h-8 w-8 rounded-full"
                                    onClick={handleAvatarClick}
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit profile picture</span>
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <CardTitle className="pt-4">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </CardHeader>
                     </Card>
                 </div>
                 <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('profile.card_title')}</CardTitle>
                            <CardDescription>{t('profile.card_description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('labels.full_name')}</FormLabel>
                                                <FormControl><Input placeholder={t('placeholders.your_name')} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="mobileNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('labels.mobile_number')}</FormLabel>
                                                    <FormControl><Input type="tel" placeholder="e.g., 9876543210" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="pinCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('labels.pincode')}</FormLabel>
                                                    <FormControl><Input placeholder="e.g., 411001" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                                        {form.formState.isSubmitting ? t('actions.saving') : t('actions.save_changes')}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-muted-foreground">A password reset link will be sent to your email.</p>
                                    </div>
                                    <Button variant="outline" onClick={handlePasswordReset} disabled={isPasswordResetting}>
                                        {isPasswordResetting ? <Loader2 className="mr-2 animate-spin" /> : <KeyRound className="mr-2" />}
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
