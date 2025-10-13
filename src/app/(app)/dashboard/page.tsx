
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Link as LinkIcon, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBatches } from "@/hooks/use-batches";
import { DashboardStats } from "./_components/DashboardStats";
import { useAppUser } from "@/app/app-provider";
import { ConnectDealerDialog } from './_components/connect-dealer-dialog';
import { PendingOrders } from './_components/pending-orders';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';


export default function DashboardPage() {
  const { user, loading: userLoading } = useAppUser();
  const [isConnectDealerOpen, setConnectDealerOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [installEvent, setInstallEvent] = useState<Event | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);


  useEffect(() => {
    // Check if the app is already installed
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const { batches, loading: batchesLoading } = useBatches(user?.id || "");
  
  const loading = userLoading || !user;

  const poultryMitraId = useMemo(() => 
    user ? `PM-FARM-${user.id.substring(0, 5).toUpperCase()}` : '',
  [user]);

  const activeBatches = useMemo(() => 
    batches.filter(b => b.status === 'Active'),
  [batches]);

  const handleCopyId = () => {
    if (!poultryMitraId) return;
    navigator.clipboard.writeText(poultryMitraId);
    toast({ title: t('messages.copied_title'), description: t('messages.copied_desc') });
  }

  const handleInstallClick = () => {
    if (installEvent) {
      (installEvent as any).prompt();
      (installEvent as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsAppInstalled(true);
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallEvent(null);
      });
    }
  };


  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin size-8" /></div>;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{t('dashboard.welcome', { name: user.name.split(' ')[0] })} 👋</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{poultryMitraId}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyId}>
                    <Copy className="size-3" />
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
            <Badge className="capitalize" variant={user.planType === 'premium' ? 'default' : 'secondary'}>{t(`plans.${user.planType}`)}</Badge>
             {user.role === 'farmer' && (
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setConnectDealerOpen(true)}>
                    <LinkIcon className="mr-2" />
                    {t('dashboard.connect_dealer')}
                </Button>
             )}
             {installEvent && !isAppInstalled && (
              <Button size="sm" onClick={handleInstallClick}>
                <Download className="mr-2" />
                Install App
              </Button>
             )}
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats batches={activeBatches} loading={batchesLoading} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PendingOrders />
      </div>
      <ConnectDealerDialog open={isConnectDealerOpen} onOpenChange={setConnectDealerOpen} />
    </>
  );
}
