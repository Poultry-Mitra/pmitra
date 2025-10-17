

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bell, Search, AlertTriangle, Loader2, Calculator, Stethoscope } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/components/language-provider';
import { useAppUser } from '@/app/app-provider';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { user: appUser, loading: isUserLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const { t } = useLanguage();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
    setShowLogoutAlert(false);
  };


  if (isUserLoading || !appUser) {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="ml-auto">
          <Loader2 className="animate-spin" />
        </div>
      </header>
    );
  }

  const userName = appUser.name || "User";
  const userFallback = appUser.name ? appUser.name.charAt(0) : "U";


  return (
    <>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="md:hidden" />
        
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/tools">
                    <Calculator className="size-5" />
                    <span className="sr-only">Calculator</span>
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/diagnose-health">
                    <Stethoscope className="size-5" />
                    <span className="sr-only">Diagnose</span>
                </Link>
            </Button>
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="size-5" />
                <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>{userFallback}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t('profile.title')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowLogoutAlert(true)}>{t('actions.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </header>
         <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive"/>
                    {t('dialog.logout_title')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                {t('dialog.logout_desc')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                    {t('actions.logout')}
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    
