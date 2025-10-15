'use client';

import { useState } from 'react';
import { PageHeader } from '@/app/admin/_components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppUser } from '@/app/app-provider';
import { createAdminRole } from '@/app/actions/create-admin-role';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSetupPage() {
  const { user, loading } = useAppUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleMakeAdmin = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action.',
        variant: 'destructive',
      });
      return;
    }

    if (user.email !== 'ipoultrymitra@gmail.com') {
      toast({
        title: 'Unauthorized',
        description: 'Only the primary admin account can perform this action.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAdminRole(user.id, user.email);
      if (result.success) {
        toast({
          title: 'Admin Role Granted',
          description: 'You have been successfully set as an admin. Redirecting to dashboard...',
        });
        // Redirect to dashboard after a short delay to allow context to update
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <>
      <PageHeader
        title="One-Time Admin Setup"
        description="Finalize your administrator account configuration."
      />
      <div className="mt-8 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive"/>
                Important: One-Time Action
            </CardTitle>
            <CardDescription>
              This page is for the initial setup of the primary administrator account ({user?.email}). Clicking the button below will grant your account full administrative privileges across the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-muted-foreground">
              Ensure you are logged in with the correct account before proceeding. This action will create a permanent admin role document in the database linked to your User ID.
            </p>
            <Button
              size="lg"
              onClick={handleMakeAdmin}
              disabled={isSubmitting || user?.email !== 'ipoultrymitra@gmail.com'}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2" />
              )}
              {isSubmitting ? 'Assigning Role...' : 'Make Me Admin'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
