
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  AreaChart,
  Users,
  CreditCard,
  ShieldCheck,
  Star,
  LayoutGrid,
  Twitter,
  Facebook,
  Linkedin,
  Download,
  Store
} from 'lucide-react';
import { AppIcon } from './icon-component';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import { RateTicker } from './_components/rate-ticker';
import { useUser, useAuth, useFirestore } from '@/firebase/provider';
import type { User as AppUserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AppProvider, useAppUser } from '@/app/app-provider';
import { Input } from '@/components/ui/input';


function LandingPageContent() {
  const { t } = useLanguage();
  const { user: firebaseUser, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { user: appUser, loading: isAppUserLoading } = useAppUser();
  
  const getDashboardPath = () => {
    if (isUserLoading || isAppUserLoading || !appUser) return "/login";
    switch (appUser.role) {
      case 'farmer':
        return '/dashboard';
      case 'dealer':
        return '/dealer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };


  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }
  };

  const features = [
    {
      icon: <Bot className="size-8 text-primary" />,
      title: t('features.aiChat.title'),
      description: t('features.aiChat.description'),
    },
    {
      icon: <LayoutGrid className="size-8 text-primary" />,
      title: t('features.flockTracking.title'),
      description: t('features.flockTracking.description'),
    },
    {
      icon: <Users className="size-8 text-primary" />,
      title: t('features.dealerManagement.title'),
      description: t('features.dealerManagement.description'),
    },
    {
      icon: <CreditCard className="size-8 text-primary" />,
      title: t('features.payments.title'),
      description: t('features.payments.description'),
    },
    {
      icon: <AreaChart className="size-8 text-primary" />,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
    },
    {
      icon: <ShieldCheck className="size-8 text-primary" />,
      title: t('features.monitoring.title'),
      description: t('features.monitoring.description'),
    },
  ];

  const pricingPlans = [
    { name: 'free_plan', price: t('pricing.free_plan_price'), period: t('pricing.free_plan_period'), cta: t('pricing.free_plan_cta') },
    { name: 'farmer_plan', price: t('pricing.farmer_plan_price'), period: t('pricing.plan_period'), cta: t('pricing.farmer_plan_cta') },
    { name: 'dealer_plan', price: t('pricing.dealer_plan_price'), period: t('pricing.plan_period'), cta: t('pricing.dealer_plan_cta') },
  ]

  const testimonials = [
    {
      name: "Ravi Kumar",
      role: t('testimonials.farmer_role'),
      quote: t('testimonials.farmer_quote'),
    },
    {
      name: "Priya Sharma",
      role: t('testimonials.dealer_role'),
      quote: t('testimonials.dealer_quote'),
    },
  ];

  const getStartedHref = () => {
    if (isUserLoading || isAppUserLoading) return "/login"; // Default during load to prevent mismatch
    if (firebaseUser && appUser) return getDashboardPath();
    return "/signup";
  };
  
    return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppIcon className="size-6 text-primary" />
            <span className="font-bold font-headline">PoultryMitra</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="/" className="transition-colors hover:text-foreground">{t('nav.home')}</Link>
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.features')}</Link>
            <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.pricing')}</Link>
            <Link href="/chat" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.ai_chat')}</Link>
            <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.contact')}</Link>
          </nav>
          <div className="ml-auto flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
             {isUserLoading || isAppUserLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            ) : firebaseUser && appUser ? (
              <>
                <Button asChild>
                  <Link href={getDashboardPath()}>Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <RateTicker />
      </header>
      <main className="flex-1">
        <section id="hero" className="container flex flex-col items-center justify-center gap-8 py-20 text-center md:py-28 lg:py-32">
            <div className="flex flex-col items-center gap-4">
                <h1 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                {t('hero.title')}
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                {t('hero.subtitle')}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button size="lg" asChild>
                      <Link href={getStartedHref()}>{t('hero.get_started')}</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                      <Link href="#features">{t('hero.watch_demo')}</Link>
                  </Button>
                </div>
            </div>
        </section>

        <section id="features" className="container space-y-12 py-8 md:py-16 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              {t('features.title')}
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={i}>
                <CardHeader>
                    {feature.icon}
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing-preview" className="bg-secondary py-16 lg:py-24">
            <div className="container">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{t('pricing.title')}</h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">{t('pricing.subtitle')}</p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                  {pricingPlans.map(plan => (
                    <Card key={plan.name} className="flex flex-col justify-between text-center">
                      <CardHeader>
                        <CardTitle className="text-lg font-medium text-muted-foreground">{t(`pricing.${plan.name}`)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p><span className="text-4xl font-bold">{plan.price}</span><span className="text-muted-foreground">{plan.period}</span></p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                           <Link href="/pricing">{plan.cta}</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
            </div>
        </section>

        <section id="testimonials" className="py-16 lg:py-24">
            <div className="container">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{t('testimonials.title')}</h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">{t('testimonials.subtitle')}</p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-2">
                    {testimonials.map((item, i) => (
                        <Card key={i} className="bg-secondary/50 dark:bg-card">
                            <CardContent className="pt-6">
                                <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-5 fill-accent text-accent" />
                                    ))}
                                </div>
                                <blockquote className="mt-4 text-base text-foreground">
                                    "{item.quote}"
                                </blockquote>
                                <div className="mt-6 flex items-center gap-4">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-muted font-bold">{item.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section id="cta" className="container py-16 md:py-20 lg:py-24">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center bg-primary text-primary-foreground p-12 rounded-xl">
                 <h2 className="font-headline text-3xl font-bold md:text-4xl">{t('cta.title')}</h2>
                 <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">{t('cta.subtitle')}</p>
                 <Button size="lg" variant="secondary" className="mt-8" asChild>
                    <Link href="/signup">{t('cta.button')}</Link>
                 </Button>
            </div>
        </section>
      </main>

      <footer id="contact" className="border-t bg-secondary/50 text-foreground">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center space-x-2">
                <AppIcon className="size-8 text-primary" />
                <span className="text-xl font-bold font-headline">PoultryMitra</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">{t('hero.subtitle')}</p>
              <div className="mt-4 flex space-x-4">
                <Link href="#"><Twitter className="size-5 text-muted-foreground hover:text-primary" /></Link>
                <Link href="#"><Facebook className="size-5 text-muted-foreground hover:text-primary" /></Link>
                <Link href="#"><Linkedin className="size-5 text-muted-foreground hover:text-primary" /></Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Company</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link href="#features" className="text-muted-foreground hover:text-primary">{t('footer.about')}</Link>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary">{t('nav.pricing')}</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link>
              </nav>
            </div>

            <div>
              <h3 className="font-semibold">Support</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link href="#contact" className="text-muted-foreground hover:text-primary">{t('footer.contact')}</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">FAQs</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">{t('footer.terms')}</Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">{t('footer.privacy')}</Link>
              </nav>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold">Stay Updated</h3>
              <p className="text-muted-foreground text-sm mt-4">Subscribe to our newsletter for the latest updates and tips.</p>
              <div className="mt-4 flex w-full max-w-sm items-center space-x-2">
                  <Input type="email" placeholder="Email" />
                  <Button type="submit">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function LandingPage() {
    return (
        <AppProvider allowedRoles={['public']}>
            <LandingPageContent />
        </AppProvider>
    )
}
