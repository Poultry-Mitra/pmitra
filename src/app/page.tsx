import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LayoutDashboard,
  MessageSquare,
  HeartPulse,
  Wheat,
  Users,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AppIcon } from '@/app/icon';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

const features = [
  {
    icon: <LayoutDashboard className="size-8 text-primary" />,
    title: 'Analytics Dashboard',
    description: 'Visualize key farm metrics like production rates, mortality, and feed consumption.',
  },
  {
    icon: <MessageSquare className="size-8 text-primary" />,
    title: 'AI Chat Support',
    description: 'Get instant answers to your poultry farming questions with our expert AI assistant.',
  },
  {
    icon: <HeartPulse className="size-8 text-primary" />,
    title: 'Farm Monitoring',
    description: 'Real-time monitoring of farm conditions with alerts for critical events and AI-powered forecasts.',
  },
  {
    icon: <Wheat className="size-8 text-primary" />,
    title: 'Feed Recommendation',
    description: 'Our AI analyzes your farm data to recommend the most optimal and cost-effective feed.',
  },
  {
    icon: <Users className="size-8 text-primary" />,
    title: 'User Management',
    description: 'An intuitive interface for admins to manage users, roles, and subscriptions.',
  },
  {
    icon: <CreditCard className="size-8 text-primary" />,
    title: 'Premium Plans',
    description: 'Unlock advanced features, detailed reports, and unlimited AI support with a subscription.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppIcon className="size-6 text-primary" />
            <span className="font-bold font-headline">PoultryMitra</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-primary">Features</Link>
            <Link href="/pricing" className="transition-colors hover:text-primary">Pricing</Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-headline text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                The Future of Poultry Farming is Here
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                PoultryMitra is your AI-powered partner for a more productive and profitable farm. Get intelligent insights, real-time monitoring, and expert advice at your fingertips.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                   <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            {heroImage && (
              <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-2xl md:h-96">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              </div>
            )}
          </div>
        </section>

        <section id="features" className="container space-y-6 bg-secondary py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Powerful Features for Smart Farming
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to manage and grow your poultry business, powered by cutting-edge AI.
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
                 <h2 className="font-headline text-3xl font-bold md:text-5xl">Start Optimizing Your Farm Today</h2>
                 <p className="mt-4 max-w-xl text-lg text-muted-foreground">Join hundreds of farmers who are revolutionizing their operations with PoultryMitra. Get started for free, no credit card required.</p>
                 <Button size="lg" className="mt-8" asChild>
                    <Link href="/dashboard">Sign Up Now</Link>
                 </Button>
            </div>
        </section>

      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Your AI Assistant. The source code is available on GitHub.
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
