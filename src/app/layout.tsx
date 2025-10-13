
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
            </ThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
