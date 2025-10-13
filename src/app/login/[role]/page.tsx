
'use client';

import Link from 'next/link';
import { AppIcon } from '@/app/icon-component';
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
import { sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, UserCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.999,35.596,44,30.165,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    )
}

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      handleLogin(firebaseUser);
    } else {
      setIsCheckingUser(false);
    }
  }, [firebaseUser, isUserLoading, firestore, router]);

  async function handleLogin(user: AppUser | any) { // Accepts Firebase User or AppUser
    if (!firestore || !auth) return;
    setIsCheckingUser(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data() as AppUser;
      if (userData.role !== role) {
        await auth.signOut();
        toast({ title: "Role Mismatch", description: `This account is a ${userData.role}. Please use the correct login page.`, variant: "destructive" });
        setIsCheckingUser(false);
        setIsSubmitting(false);
        router.replace(`/login/${userData.role}`);
        return;
      }
      if (userData.status === 'Pending') {
        await auth.signOut();
        toast({ title: "Account Pending", description: "Your account is pending approval by an administrator.", variant: "destructive" });
        setIsCheckingUser(false);
        setIsSubmitting(false);
        return;
      }
      if (userData.status === 'Suspended') {
        await auth.signOut();
        toast({ title: "Account Suspended", description: "Your account has been suspended. Please contact support.", variant: "destructive" });
        setIsCheckingUser(false);
        setIsSubmitting(false);
        return;
      }
      router.replace(getRedirectPath(role));
    } else {
      // This can happen if a user signs up with Google but doesn't complete the profile
      // Or if the Firestore document creation failed silently before.
      await auth.signOut();
      toast({ title: 'Login Failed', description: 'User profile not found. Please sign up or contact support.', variant: 'destructive' });
      setIsCheckingUser(false);
      setIsSubmitting(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!auth) {
      toast({ title: 'Error', description: 'Authentication service not available.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The useEffect hook will now handle the successful login
    } catch (error: any) {
        let message = 'An unknown error occurred.';
        if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
            message = 'Invalid email or password. Please try again.';
        }
        toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useEffect will handle the successful login
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        console.error("Google sign-in error:", error);
        toast({ title: "Google Sign-In Failed", description: "Could not sign in with Google. Please try again.", variant: "destructive" });
    } finally {
        setIsGoogleLoading(false);
    }
  };

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

  const isLoading = isSubmitting || isCheckingUser || isGoogleLoading || isUserLoading;
  
  const title = {
      farmer: "Farmer Login",
      dealer: "Dealer Login",
      admin: "Admin Login"
  }[role] || "Login";


  if (isLoading && firebaseUser) {
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
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                {isSubmitting ? t('messages.loading') : 'Login'}
              </Button>
            </form>
          </Form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isGoogleLoading ? <Loader2 className="mr-2 animate-spin" /> : <GoogleIcon />}
                Continue with Google
            </Button>

        </CardContent>
      </Card>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          {t('login.no_account')}{' '}
          <Link href={`/signup/${role}`} className="font-semibold text-primary hover:underline">
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
