

"use client";

import Link from "next/link";
import { AppIcon } from "@/app/icon";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Shield, Loader2 } from "lucide-react";
import { useUser, useFirestore } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";

export default function LoginPage() {
  const { t } = useLanguage();
  const firebaseUser = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseUser === null) {
      // User is not logged in, stop loading.
      setLoading(false);
      return;
    }

    if (firebaseUser && firestore) {
      // User is logged in, fetch their role from Firestore.
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as AppUser;
          // Redirect based on role
          switch(userData.role) {
            case 'farmer':
              router.push('/dashboard');
              break;
            case 'dealer':
              router.push('/dealer/dashboard');
              break;
            case 'admin':
              router.push('/admin/dashboard');
              break;
            default:
              // Fallback if role is not set
              setLoading(false);
          }
        } else {
          // User document doesn't exist, maybe they need to complete signup
          setLoading(false);
        }
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [firebaseUser, firestore, router]);


  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Authenticating...</p>
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
                        <Button className="w-full" asChild>
                           <Link href="/dashboard">
                                {t('login.farmer_button')} <ArrowRight className="ml-2" />
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-accent-foreground/80">{t('login.dealer_title')}</CardTitle>
                        <CardDescription>{t('login.dealer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" asChild>
                            <Link href="/dealer/dashboard">
                                {t('login.dealer_button')} <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                <p>
                    <Link href="/admin/dashboard" className="flex items-center justify-center gap-2 font-semibold text-primary hover:underline">
                        <Shield className="size-4" /> {t('login.admin_login')}
                    </Link>
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
