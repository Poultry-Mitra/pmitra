
"use client";
import { useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/app/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { Mail, KeyRound, User, Phone, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

function Illustration() {
    const { t } = useLanguage();
    return (
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-col lg:text-center lg:p-12 bg-primary/5 dark:bg-primary/10">
             <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl"></div>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="relative">
                    <path fill="#2E7D32" d="M47.8,-63.9C61.8,-55.8,72.9,-42,79.5,-26.5C86.1,-11,88.2,6.1,82.9,21.1C77.6,36.1,65,49,50.9,59.3C36.8,69.5,21.2,77.1,4.9,78.2C-11.4,79.3,-27.7,73.8,-42.6,65.3C-57.5,56.8,-71,45.3,-78.3,30.7C-85.6,16.1,-86.7,-1.5,-80.7,-16.1C-74.7,-30.7,-61.6,-42.3,-48,-50.2C-34.4,-58.1,-20.3,-62.3,-5.6,-64.3C9.1,-66.3,18.1,-66.1,28.2,-67.2C38.3,-68.3,47.8,-63.9,47.8,-63.9" transform="translate(100 100)" />
                    <g transform="translate(100 100) scale(0.8)">
                        <path d="M58.3,64.2c0,11.2-9.1,20.3-20.3,20.3H-17.2c-11.2,0-20.3-9.1-20.3-20.3V-20.3C-37.5-31.5-28.4-40.6-17.2-40.6H38 c11.2,0,20.3,9.1,20.3,20.3V64.2z M-17.2-50.6c-16.7,0-30.3,13.6-30.3,30.3V64.2c0,16.7,13.6,30.3,30.3,30.3H38 c16.7,0,30.3-13.6,30.3-30.3V-20.3c0-16.7-13.6-30.3-30.3-30.3H-17.2z" fill="#FFFFFF"/>
                        <path d="M23.1,10.6c-3.4,0-6.1,2.8-6.1,6.1s2.8,6.1,6.1,6.1s6.1-2.8,6.1-6.1S26.5,10.6,23.1,10.6z" fill="#FBC02D"/>
                        <path d="M-17.2-57c-1.7,0-3-1.4-3-3s1.4-3,3-3s3,1.4,3,3S-15.5-57-17.2-57z" fill="#FBC02D"/>
                        <path d="M-27.2-57c-1.7,0-3-1.4-3-3s1.4-3,3-3s3,1.4,3,3S-25.5-57-27.2-57z" fill="#FBC02D"/>
                        <path d="M-7.2-57c-1.7,0-3-1.4-3-3s1.4-3,3-3s3,1.4,3,3S-5.5-57-7.2-57z" fill="#FBC02D"/>
                    </g>
                </svg>
             </div>
            <div className="mt-8 max-w-sm">
                <h2 className="font-headline text-3xl font-bold text-foreground">PoultryMitra</h2>
                <p className="mt-2 text-muted-foreground">{t('login.illustration_subtitle')}</p>
            </div>
        </div>
    )
}

function LoginForm() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="size-4" />{t('login.email_phone_label')}</Label>
        <Input id="email" placeholder={t('login.email_phone_placeholder')} type="email" />
        <span className="text-xs text-muted-foreground">{t('login.email_phone_hint')}</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2"><KeyRound className="size-4" />{t('login.password_label')}</Label>
        <Input id="password" placeholder="••••••••" type="password" />
        <Link href="#" className="inline-block text-xs text-primary hover:underline">
          {t('login.forgot_password')}
        </Link>
      </div>
      <div className="space-y-3">
        <Button className="w-full rounded-xl font-bold">{t('login.login_as_farmer')}</Button>
        <Button variant="secondary" className="w-full rounded-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground">{t('login.login_as_dealer')}</Button>
      </div>
      <p className="text-center text-xs">
        <Link href="#" className="text-muted-foreground hover:text-primary">{t('login.admin_login')}</Link>
      </p>
    </div>
  );
}

function SignupForm() {
    const { t } = useLanguage();
    const [role, setRole] = useState("farmer");

    return (
        <div className="space-y-6">
             <div className="space-y-2">
                <Label className="flex items-center gap-2"><Briefcase className="size-4"/>{t('signup.role_label')}</Label>
                <Tabs value={role} onValueChange={setRole} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="farmer">{t('signup.farmer_role')}</TabsTrigger>
                        <TabsTrigger value="dealer">{t('signup.dealer_role')}</TabsTrigger>
                    </TabsList>
                </Tabs>
             </div>
            <div className="space-y-2">
                <Label htmlFor="fullname" className="flex items-center gap-2"><User className="size-4"/>{t('signup.fullname_label')}</Label>
                <Input id="fullname" placeholder={t('signup.fullname_placeholder')} />
                 <span className="text-xs text-muted-foreground">{t('signup.fullname_hint')}</span>
            </div>
            <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2"><Mail className="size-4"/>{t('signup.email_label')}</Label>
                <Input id="signup-email" placeholder={t('signup.email_placeholder')} type="email" />
                 <span className="text-xs text-muted-foreground">{t('signup.email_hint')}</span>
            </div>
             <div className="space-y-2">
                <Label htmlFor="signup-phone" className="flex items-center gap-2"><Phone className="size-4"/>{t('signup.phone_label')}</Label>
                <Input id="signup-phone" placeholder={t('signup.phone_placeholder')} type="tel" />
                 <span className="text-xs text-muted-foreground">{t('signup.phone_hint')}</span>
            </div>
            <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2"><KeyRound className="size-4"/>{t('signup.password_label')}</Label>
                <Input id="signup-password" placeholder="••••••••" type="password" />
                 <span className="text-xs text-muted-foreground">{t('signup.password_hint')}</span>
            </div>
            <Button className="w-full rounded-xl font-bold">{t('signup.create_account_button')}</Button>
             <p className="text-center text-xs text-muted-foreground">
                {t('signup.terms_prefix')}{' '}
                <Link href="#" className="text-primary hover:underline">{t('signup.terms_link')}</Link>
                {' '}&{' '}
                <Link href="#" className="text-primary hover:underline">{t('signup.privacy_link')}</Link>.
            </p>
        </div>
    )
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-background font-body lg:grid lg:grid-cols-2">
      <Illustration />
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <AppIcon className="h-12 w-12 text-primary" />
                </Link>
                <h1 className="mt-4 font-headline text-3xl font-bold">{t('login.title')}</h1>
                <p className="font-hindi text-muted-foreground">{t('login.subtitle')}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t('login.tab')}</TabsTrigger>
                    <TabsTrigger value="signup">{t('signup.tab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className={cn("transition-opacity", activeTab !== 'login' && "opacity-0 hidden")}>
                    <LoginForm />
                </TabsContent>
                <TabsContent value="signup" className={cn("transition-opacity", activeTab !== 'signup' && "opacity-0 hidden")}>
                    <SignupForm />
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
