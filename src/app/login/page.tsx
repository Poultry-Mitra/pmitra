
"use client";

import Link from "next/link";
import { AppIcon } from "@/app/icon";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
        <div className="absolute right-4 top-4">
            <LanguageToggle />
        </div>
        <div className="w-full max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t('login.welcome_title')}
            </h1>
            <p className="mt-2 text-muted-foreground">
            {t('login.welcome_subtitle')}
            </p>
            
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-green-700 dark:text-green-500">{t('login.farmer_title')}</CardTitle>
                        <CardDescription>{t('login.farmer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" asChild>
                           <Link href="/dashboard">
                                {t('login.farmer_button')} <ArrowRight className="ml-2" />
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="text-left">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-blue-700 dark:text-blue-500">{t('login.dealer_title')}</CardTitle>
                        <CardDescription>{t('login.dealer_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href="/dashboard">
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
                <div className="flex items-center justify-center gap-6">
                    <Link href="/" className="flex items-center gap-2 hover:text-primary">
                        <ArrowLeft className="size-4" /> {t('login.back_to_home')}
                    </Link>
                    <Link href="/admin/dashboard" className="hover:text-primary">
                        {t('login.admin_login')}
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
