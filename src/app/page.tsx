"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LayoutDashboard,
  MessageSquare,
  HeartPulse,
  Wheat,
  Users,
  CreditCard,
} from 'lucide-react';
import { AppIcon } from '@/app/icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';


export default function LandingPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <LayoutDashboard className="size-8 text-primary" />,
      title: t('featureAnalyticsTitle'),
      description: t('featureAnalyticsDesc'),
    },
    {
      icon: <MessageSquare className="size-8 text-primary" />,
      title: t('featureChatTitle'),
      description: t('featureChatDesc'),
    },
    {
      icon: <HeartPulse className="size-8 text-primary" />,
      title: t('featureMonitoringTitle'),
      description: t('featureMonitoringDesc'),
    },
    {
      icon: <Wheat className="size-8 text-primary" />,
      title: t('featureFeedTitle'),
      description: t('featureFeedDesc'),
    },
    {
      icon: <Users className="size-8 text-primary" />,
      title: t('featureUsersTitle'),
      description: t('featureUsersDesc'),
    },
    {
      icon: <CreditCard className="size-8 text-primary" />,
      title: t('featurePlansTitle'),
      description: t('featurePlansDesc'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppIcon className="size-6 text-primary" />
            <span className="font-bold font-headline">PoultryMitra</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-primary">{t('features')}</Link>
            <Link href="/pricing" className="transition-colors hover:text-primary">{t('pricing')}</Link>
          </nav>
          <div className="ml-auto flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
            <Button variant="ghost" asChild>
              <Link href="/dashboard">{t('signIn')}</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">{t('getStarted')}</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex flex-col items-start gap-4">
            <h1 className="font-headline text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              {t('heroSubtitle')}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">{t('exploreDashboard')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                 <Link href="#features">{t('learnMore')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container space-y-6 bg-secondary py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              {t('powerfulFeatures')}
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              {t('featuresSubtitle')}
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-background">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                 <h2 className="font-headline text-3xl font-bold md:text-5xl">{t('startOptimizing')}</h2>
                 <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t('startOptimizingSubtitle')}</p>
                 <Button size="lg" className="mt-8" asChild>
                    <Link href="/dashboard">{t('signUpNow')}</Link>
                 </Button>
            </div>
        </section>

      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('footerText')}
          </p>
          <div className="flex items-center space-x-2">
            <AppIcon className="size-5 text-primary"/>
            <span className="font-bold font-headline">PoultryMitra</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
