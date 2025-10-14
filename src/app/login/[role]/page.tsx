
'use client';

import Link from 'next/link';
import { AppIcon } from '@/app/icon-component';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { User as AppUser, UserRole } from '@/lib/types';
import { sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, type User as FirebaseAuthUser, sendEmailVerification } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppUser } from '@/app/app-provider';

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
  const { user: appUser, loading: isAppLoading } = useAppUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const role = params.role as UserRole;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const getRedirectPath = (userRole?: UserRole | null) => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) return redirectParam;

    if (!userRole) return '/login';

    return {
      farmer: '/dashboard',
      dealer: '/dealer/dashboard',
      admin: '/admin/dashboard',
    }[userRole] || '/';
  }

  // Effect to redirect already logged-in users
  useEffect(() => {
    if (!isAppLoading && appUser) {
      router.replace(getRedirectPath(appUser.role));
    }
  }, [appUser, isAppLoading, router]);

  const resendVerificationEmail = async () => {
    if (auth && auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({ title: "Verification Email Sent", description: "A new verification link has been sent to your email address." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to send verification email. Please try again later.", variant: "destructive" });
      }
    }
  };

  async function handleLoginSuccess(user: FirebaseAuthUser) {
    if (!firestore || !auth) {
      throw new Error('System not ready. Please try again.');
    }

    const isEmailPasswordSignIn = user.providerData.some(p => p.providerId === 'password');
    // We need to reload the user to get the latest emailVerified status
    await user.reload();
    const isEmailVerified = user.emailVerified;
    
    // Special handling for admin role, no need to check 'users' collection
    if (role === 'admin' && user.email === 'ipoultrymitra@gmail.com') {
      router.replace(getRedirectPath('admin'));
      return;
    }
    
    if (role === 'admin' && user.email !== 'ipoultrymitra@gmail.com') {
        await auth.signOut();
        throw new Error('This is not a valid admin account.');
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      await auth.signOut();
      // Throw a specific error to be caught by the caller.
      throw new Error('User profile not found. Please sign up or contact support.');
    }

    const userData = docSnap.data() as AppUser;
    
    if (userData.role !== role) {
      await auth.signOut();
      toast({ title: "Role Mismatch", description: `This account is a ${userData.role || 'undefined'}. Please use the correct login page.`, variant: "destructive" });
      router.replace(`/login/${userData.role}`);
      return;
    }

    // Auto-activate user if they are pending and have verified their email
    if (userData.status === 'Pending' && isEmailVerified) {
        await updateDoc(userDocRef, { status: 'Active' });
        userData.status = 'Active'; // Update local object to continue login flow
    } else if (isEmailPasswordSignIn && !isEmailVerified) {
        await auth.signOut();
        toast({
            title: "Email Not Verified",
            description: "Please verify your email address before logging in. Check your inbox for a verification link.",
            variant: "destructive",
            action: <Button variant="secondary" size="sm" onClick={resendVerificationEmail}>Resend Email</Button>,
            duration: 10000,
        });
        throw new Error("Email not verified");
    }
    
    if (userData.status !== 'Active') {
        await auth.signOut();
        const message = userData.status === 'Pending' 
            ? "Your account is pending approval. You will be notified once it is active."
            : "Your account has been suspended. Please contact support for assistance.";
        throw new Error(message);
    }
    
    router.replace(getRedirectPath(role));
  }

  async function onSubmit(values: FormValues) {
    if (!auth) return;
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
        let message = error.message || 'An unknown error occurred.';
        // Don't show generic error for specific auth codes
        if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
            message = 'Invalid email or password. Please try again.';
        }
        
        // Don't show toast if it's our custom "Email not verified" error
        if (message !== "Email not verified") {
            toast({ title: 'Login Failed', description: message, variant: 'destructive' });
        }
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
        let message = error.message || 'Could not sign in with Google. Please try again.';
        if (error.code === 'auth/popup-closed-by-user') {
            setIsGoogleLoading(false);
            return;
        }
        
        console.error("Google sign-in error:", error);
        toast({ title: "Google Sign-In Failed", description: message, variant: "destructive" });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
    const email = form.getValues('email');
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email to reset your password.", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for reset instructions." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send password reset email.", variant: "destructive" });
    }
  };

  const isLoading = isSubmitting || isGoogleLoading || isAppLoading;
  
  if (isAppLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 font-body">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
          <CardTitle className="font-headline text-2xl capitalize">{role} Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                       <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleForgotPassword}>
                          Forgot Password?
                       </Button>
                    </div>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isGoogleLoading && <Loader2 className="mr-2 animate-spin" />}
                {!isGoogleLoading && <GoogleIcon />}
                Continue with Google
            </Button>

        </CardContent>
      </Card>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Don't have an account? <Link href={`/signup/${role}`} className="font-semibold text-primary hover:underline">Register here</Link></p>
        <p className="mt-2"><Link href="/login" className="font-semibold text-primary hover:underline">Choose a different login type</Link></p>
      </div>
    </div>
  );
}

    