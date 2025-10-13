
"use client";

import { useEffect } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Inter, Noto_Sans, Hind } from 'next/font/google';
import { cn } from '@/lib/utils';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontNotoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans',
});

const fontHind = Hind({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-hind',
});

// Metadata is now defined as a static object as we are in a client component
// For dynamic metadata, you would use the `generateMetadata` function in a server component layout.
// export const metadata: Metadata = {
//   title: 'PoultryMitra - Your AI-Powered Poultry Farming Assistant',
//   description: 'Leverage AI to optimize your poultry farm with data analytics, real-time monitoring, and expert support.',
//   icons: {
//     icon: '/icon.svg',
//   },
// };

function PwaInstaller() {
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if(isStandalone) return;
      
      const deferredPrompt = e;

      const { dismiss } = toast({
        title: "Install PoultryMitra App?",
        description: "Get a native app experience on your device for easy access.",
        duration: 10000, // 10 seconds
        action: (
          <Button
            onClick={() => {
              dismiss();
              (deferredPrompt as any).prompt();
              (deferredPrompt as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                } else {
                  console.log('User dismissed the install prompt');
                }
              });
            }}
          >
            Install
          </Button>
        ),
      });

    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  return null;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PoultryMitra - Your AI-Powered Poultry Farming Assistant</title>
        <meta name="description" content="Leverage AI to optimize your poultry farm with data analytics, real-time monitoring, and expert support." />
        <link rel="icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1565C0" />
      </head>
      <body 
        className={cn(
          "font-body antialiased",
          fontInter.variable,
          fontNotoSans.variable,
          fontHind.variable
        )}
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
                {children}
                <Toaster />
                <FirebaseErrorListener />
                <PwaInstaller />
            </ThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
