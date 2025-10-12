"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AppIcon } from "../icon";

export default function LoginPage() {
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
            
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{t('signup.farmer_title')}</CardTitle>
                        <CardDescription>{t('signup.farmer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                           <Link href="/login/farmer">
                                Login as Farmer <ArrowRight className="ml-2" />
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-accent-foreground/80">{t('signup.dealer_title')}</CardTitle>
                        <CardDescription>{t('signup.dealer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link href="/login/dealer">
                                Login as Dealer <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-red-600">Admin Login</CardTitle>
                        <CardDescription>Access the central control panel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="destructive" asChild>
                            <Link href="/login/admin">
                                Login as Admin <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                <p>
                    {t('signup.have_account')}{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        {t('signup.register_here')}
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
