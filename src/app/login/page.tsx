
'use client';

import Link from 'next/link';
import { AppIcon } from '@/app/icon';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser, useAuth, useFirestore } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { t } = useLanguage();
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (firebaseUser && firestore) {
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as AppUser;
            const targetPath =
              {
                farmer: '/dashboard',
                dealer: '/dealer/dashboard',
                admin: '/admin/dashboard',
              }[userData.role] || '/';
            router.replace(targetPath);
          } else {
            // User authenticated but no profile, let them stay on login for now
            // or redirect to a profile creation page if that's the flow.
            setIsCheckingUser(false);
          }
        })
        .catch((error) => {
          console.error('Error fetching user document:', error);
          setIsCheckingUser(false);
        });
    } else {
      setIsCheckingUser(false);
    }
  }, [firebaseUser, isUserLoading, firestore, router]);


  async function onSubmit(values: FormValues) {
    if (!auth) {
      toast({ title: 'Error', description: 'Authentication service not available.', variant: 'destructive' });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The useEffect will handle redirection
    } catch (error: any) {
      let message = 'An unknown error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      }
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
      console.error('Login error:', error);
    }
  }

  const isLoading = form.formState.isSubmitting || isCheckingUser;

  if (isCheckingUser) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('messages.authenticating')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <AppIcon className="mx-auto size-10 text-primary" />
          <CardTitle className="font-headline text-2xl">{t('login.welcome_title')}</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? t('messages.loading') : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          {t('login.no_account')}{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            {t('login.register_here')}
          </Link>
        </p>
         <p className="mt-2">
            {t('login.admin_login_text')}
        </p>
      </div>
    </div>
  );
}
