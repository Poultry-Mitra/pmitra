
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AppIcon } from "@/app/icon-component";
import { AppProvider } from "../app-provider";
import { Loader2 } from "lucide-react";

function LoginPageContent() {
  const { t } = useLanguage();

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
                {t('signup.welcome_subtitle')}
            </p>
            
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{t('login.farmer_title')}</CardTitle>
                        <CardDescription>{t('login.farmer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                           <Link href="/login/farmer">
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
                        <Button className="w-full" asChild>
                            <Link href="/login/dealer">
                                {t('login.dealer_button')} <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                <p>
                    {t('login.no_account')}{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        {t('login.register_here')}
                    </Link>
                </p>
            </div>
            <div className="mt-12 text-center">
                 <Link href="/login/admin" className="text-xs text-muted-foreground hover:text-primary">
                    {t('login.admin_button')}
                </Link>
            </div>
        </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppProvider allowedRoles={['public']}>
        <LoginPageContent />
    </AppProvider>
  )
}
