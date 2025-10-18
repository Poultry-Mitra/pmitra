
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/app/icon-component';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import { useAuth } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useAppUser } from '@/app/app-provider';
import { cn } from '@/lib/utils';

export function PublicHeader() {
  const { t } = useLanguage();
  const { user: appUser, loading: isAppLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AppIcon className="size-6 text-primary" />
          <span className="font-bold font-headline">PoultryMitra</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <Link href="/" className={cn("transition-colors hover:text-foreground", pathname === "/" ? "text-foreground" : "text-muted-foreground")}>{t('nav.home')}</Link>
          <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.features')}</Link>
          <Link href="/tools" className={cn("transition-colors hover:text-foreground", pathname.startsWith("/tools") ? "text-foreground" : "text-muted-foreground")}>Tools</Link>
          <Link href="/pricing" className={cn("transition-colors hover:text-foreground", pathname === "/pricing" ? "text-foreground" : "text-muted-foreground")}>{t('nav.pricing')}</Link>
          <Link href="/#contact" className="text-muted-foreground transition-colors hover:text-foreground">{t('nav.contact')}</Link>
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
  );
}
