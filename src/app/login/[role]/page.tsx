

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
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AppUser, UserRole } from '@/lib/types';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
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

export default function RoleLoginPage() {
  const { t } = useLanguage();
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const role = params.role as UserRole;
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const getRedirectPath = (userRole: UserRole) => {
    return {
      farmer: '/dashboard',
      dealer: '/dealer/dashboard',
      admin: '/admin/dashboard',
    }[userRole] || '/';
  }

  useEffect(() => {
    if (isUserLoading) return;
    if (firebaseUser && firestore) {
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as AppUser;
            router.replace(getRedirectPath(userData.role));
          } else {
            setIsCheckingUser(false);
          }
        })
        .catch(() => setIsCheckingUser(false));
    } else {
      setIsCheckingUser(false);
    }
  }, [firebaseUser, isUserLoading, firestore, router]);


  async function onSubmit(values: FormValues) {
    if (!auth || !firestore) {
      toast({ title: 'Error', description: 'Authentication service not available.', variant: 'destructive' });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as AppUser;
        if (userData.role !== role) {
           await auth.signOut();
           toast({ title: "Role Mismatch", description: `This account is a ${userData.role}. Please use the correct login page.`, variant: "destructive" });
           form.reset();
           return;
        }
        if (userData.status === 'Pending') {
            await auth.signOut();
            toast({ title: "Account Pending", description: "Your account is pending approval by an administrator.", variant: "destructive" });
            return;
        }
        if (userData.status === 'Suspended') {
            await auth.signOut();
            toast({ title: "Account Suspended", description: "Your account has been suspended. Please contact support.", variant: "destructive" });
            return;
        }

        router.replace(getRedirectPath(role));

      } else {
         await auth.signOut();
         toast({ title: 'Login Failed', description: 'User profile not found.', variant: 'destructive' });
      }

    } catch (error: any) {
      let message = 'An unknown error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      } else {
        // Only log unexpected errors
        console.error('Login error:', error);
      }
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    }
  }

  const handleForgotPassword = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive"
      });
      return;
    }
    if (!auth) return;

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please check the email address.",
        variant: "destructive"
      });
    }
  };


  const isLoading = form.formState.isSubmitting || isCheckingUser;
  
  const title = {
      farmer: "Farmer Login",
      dealer: "Dealer Login",
      admin: "Admin Login"
  }[role] || "Login";


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
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                       <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleForgotPassword}>
                          Forgot Password?
                       </Button>
                    </div>
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
            <Link href="/login" className="font-semibold text-primary hover:underline">
                Choose a different login type
            </Link>
        </p>
      </div>
    </div>
  );
}
