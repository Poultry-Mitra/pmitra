
"use client";

import Link from "next/link";
import { AppIcon } from "@/app/icon";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Shield, Loader2 } from "lucide-react";
import { useUser, useFirestore, useAuth } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

export default function LoginPage() {
  const { t } = useLanguage();
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user auth state is resolved
    }
  
    if (firebaseUser && firestore) {
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as AppUser;
          const targetPath = {
            farmer: '/dashboard',
            dealer: '/dealer/dashboard',
            admin: '/admin/dashboard'
          }[userData.role] || '/';
          router.replace(targetPath);
        } else {
          // User exists in Auth but not in Firestore, maybe during signup
          setLoading(false);
          router.replace('/signup');
        }
      }).catch(() => {
        setLoading(false);
      });
    } else {
       setLoading(false); // No user, stop loading
    }
  }, [firebaseUser, isUserLoading, firestore, router]);


  const handleAnonymousLogin = (role: 'farmer' | 'dealer' | 'admin') => {
    if(auth) {
        initiateAnonymousSignIn(auth);
    }
  };


  if (loading || isUserLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{t('messages.authenticating')}</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
        <div className="absolute right-4 top-4">
            <LanguageToggle />
        </div>
        <div className="w-full max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2">
                <AppIcon className="size-10 text-primary" />
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {t('login.welcome_title')}
                </h1>
            </div>
            <p className="mt-2 text-muted-foreground">
            {t('login.welcome_subtitle')}
            </p>
            
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{t('login.farmer_title')}</CardTitle>
                        <CardDescription>{t('login.farmer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => handleAnonymousLogin('farmer')}>
                            {t('login.farmer_button')} <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-accent-foreground/80">{t('login.dealer_title')}</CardTitle>
                        <CardDescription>{t('login.dealer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" onClick={() => handleAnonymousLogin('dealer')}>
                            {t('login.dealer_button')} <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                <p>
                    <button onClick={() => handleAnonymousLogin('admin')} className="flex items-center justify-center gap-2 font-semibold text-primary hover:underline mx-auto">
                        <Shield className="size-4" /> {t('login.admin_login')}
                    </button>
                </p>
                <p>
                    {t('login.no_account')}{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        {t('login.register_here')}
                    </Link>
                </p>
                <div className="flex items-center justify-center gap-6">
                    <Link href="/" className="flex items-center gap-2 hover:text-primary">
                        <ArrowLeft className="size-4" /> {t('login.back_to_home')}
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
