
// src/app/page.tsx
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
  Heart,
  Calculator,
  Droplet,
  LineChart,
  Wrench,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { AppIcon } from './icon-component';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-provider';
import { useLanguage } from '@/components/language-provider';
import { useAuth } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAppUser } from '@/app/app-provider';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/app/_components/page-header';

export default function LandingPage() {
  const { t } = useLanguage();
  const { user: appUser, loading: isAppLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();
  
  const getDashboardPath = () => {
    if (isAppLoading || !appUser) return "/login";
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
      if(!auth) return;
      signOut(auth).then(() => {
        router.push('/login');
      });
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
    {
      name: t('pricing.free_plan'),
      price: t('pricing.free_plan_price'),
      priceDesc: t('pricing.free_plan_period'),
      description: "For small farms and hobbyists starting out.",
      features: [
          "1 Batch Limit",
          "Limited AI Chat Queries (5/month)",
          "Manual Data Entry",
      ],
      cta: t('pricing.free_plan_cta'),
      isPopular: false,
    },
    {
      name: t('pricing.farmer_plan'),
      price: t('pricing.farmer_plan_price'),
      priceDesc: t('pricing.plan_period'),
      description: "For growing farms that need advanced tools.",
      features: [
          "Unlimited Batches",
          "Unlimited AI Chat Queries",
          "Advanced Analytics & Reports",
          "Feed AI Suggestions",
          "Daily Market Rates Access",
      ],
      cta: t('pricing.farmer_plan_cta'),
      isPopular: true,
    },
    {
      name: t('pricing.dealer_plan'),
      price: t('pricing.dealer_plan_price'),
      priceDesc: t('pricing.plan_period'),
      description: "For dealers managing multiple farmers.",
      features: [
          "Unlimited Farmer Connections",
          "Full Dealer Dashboard",
          "Advanced Sales Analytics",
          "CRM Features",
          "Priority Support",
      ],
      cta: t('pricing.dealer_plan_cta'),
      isPopular: false,
    }
  ];

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
    if (isAppLoading) return "/login"; // Default during load to prevent mismatch
    if (appUser) return getDashboardPath();
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
             <Link href="/tools" className="text-muted-foreground transition-colors hover:text-foreground">Tools</Link>
            <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.pricing')}</Link>
            <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.contact')}</Link>
          </nav>
          <div className="ml-auto flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
             {isAppLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            ) : appUser ? (
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
      </header>
      <main className="flex-1">
        <section id="hero" className="container py-20 text-center md:py-28 lg:py-32">
          <PageHeader
                title={t('hero.title')}
                description={t('hero.subtitle')}
            />
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={getStartedHref()}>{t('hero.get_started')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">{t('hero.watch_demo')}</Link>
              </Button>
            </div>
        </section>

        <section id="interactive-tools" className="bg-secondary py-16 lg:py-24">
            <div className="container">
                 <PageHeader
                    title="Free Poultry Tools"
                    description="Use our free calculators and AI tools to make smarter decisions for your farm."
                 />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mt-12">
                   <Card className="h-full flex flex-col hover:border-primary transition-colors">
                      <CardHeader>
                          <Heart className="size-8 text-destructive" />
                          <CardTitle className="font-headline text-xl pt-2">AI Health Diagnosis</CardTitle>
                          <CardDescription>Worried about a sick bird? Check symptoms for an AI-powered diagnosis.</CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto">
                           <Button className="w-full" asChild>
                              <Link href="/tools/diagnose-health">Use Tool</Link>
                          </Button>
                      </CardFooter>
                    </Card>
                    <Card className="h-full flex flex-col hover:border-primary transition-colors">
                      <CardHeader>
                          <Calculator className="size-8 text-primary" />
                          <CardTitle className="font-headline text-xl pt-2">Broiler Farm Calculator</CardTitle>
                          <CardDescription>Estimate costs and profits for a 45-day broiler cycle.</CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto">
                           <Button className="w-full" asChild>
                              <Link href="/tools/broiler-calculator">Use Tool</Link>
                          </Button>
                      </CardFooter>
                    </Card>
                    <Card className="h-full flex flex-col hover:border-primary transition-colors">
                      <CardHeader>
                          <Droplet className="size-8 text-primary" />
                          <CardTitle className="font-headline text-xl pt-2">FCR Calculator</CardTitle>
                          <CardDescription>Calculate your Feed Conversion Ratio to measure efficiency.</CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto">
                           <Button className="w-full" asChild>
                              <Link href="/tools/fcr-calculator">Use Tool</Link>
                          </Button>
                      </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
        
        <section id="how-it-works" className="py-16 lg:py-24">
            <div className="container">
                <PageHeader
                    title="How It Works"
                    description="Start optimizing your farm in three simple steps."
                />
                <div className="relative mt-16">
                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-2/3 bg-border -z-10 hidden md:block" aria-hidden="true"></div>
                     <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary">1</div>
                            <h3 className="font-headline text-xl font-semibold">Register & Create Batch</h3>
                            <p className="text-muted-foreground">Sign up, choose your role, and set up your first poultry batch with basic details.</p>
                        </div>
                         <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary">2</div>
                            <h3 className="font-headline text-xl font-semibold">Track Data & Get Insights</h3>
                            <p className="text-muted-foreground">Log daily data like mortality and feed. Let our AI provide analytics and suggestions.</p>
                        </div>
                         <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary">3</div>
                            <h3 className="font-headline text-xl font-semibold">Optimize & Increase Profit</h3>
                            <p className="text-muted-foreground">Use AI-driven insights to improve efficiency, reduce costs, and boost your farm's profitability.</p>
                        </div>
                     </div>
                </div>
            </div>
        </section>

        <section id="features" className="container space-y-12 py-16 md:py-20 lg:py-24">
            <PageHeader
                title={t('features.title')}
                description={t('features.subtitle')}
            />
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
                <PageHeader
                    title={t('pricing.title')}
                    description={t('pricing.subtitle')}
                />
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-start">
                    {pricingPlans.map(plan => (
                        <Card key={plan.name} className={plan.isPopular ? "border-2 border-primary shadow-lg" : ""}>
                            <CardHeader className="relative">
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-4 -mt-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                                        <Zap className="size-3" /> Most Popular
                                    </div>
                                )}
                                <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="flex items-baseline gap-1 pt-2">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-sm text-muted-foreground">{plan.priceDesc}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start">
                                            <CheckCircle className="mr-2 mt-1 size-4 shrink-0 text-green-500" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.isPopular ? "default" : "outline"} asChild>
                                <Link href="/pricing">{plan.cta}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                 <div className="mt-8 text-center">
                    <Button variant="ghost" asChild>
                        <Link href="/pricing">See full comparison →</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section id="testimonials" className="py-16 lg:py-24">
            <div className="container">
                <PageHeader
                    title={t('testimonials.title')}
                    description={t('testimonials.subtitle')}
                />
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
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center space-x-2">
                <AppIcon className="size-8 text-primary" />
                <span className="text-xl font-bold font-headline">PoultryMitra</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">{t('hero.subtitle')}</p>
              <div className="mt-4 flex space-x-4">
                <Link href="#" aria-label="Twitter"><Twitter className="size-5 text-muted-foreground hover:text-primary" /></Link>
                <Link href="#" aria-label="Facebook"><Facebook className="size-5 text-muted-foreground hover:text-primary" /></Link>
                <Link href="#" aria-label="LinkedIn"><Linkedin className="size-5 text-muted-foreground hover:text-primary" /></Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Company</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link href="#features" className="text-muted-foreground hover:text-primary">{t('footer.about')}</Link>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary">{t('nav.pricing')}</Link>
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
              <p className="text-muted-foreground text-sm mt-2">Subscribe to our newsletter for the latest updates and tips.</p>
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
