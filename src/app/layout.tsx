'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Inter, Noto_Sans, Hind } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/app/app-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseProvider } from '@/firebase/provider';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fontNotoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const fontHind = Hind({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-hind',
  display: 'swap',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PoultryMitra - Your AI-Powered Poultry Farming Assistant</title>
        <meta name="description" content="Leverage AI to optimize your poultry farm with data analytics, real-time monitoring, and expert support." />
        <link rel="icon" href="/favicon.ico" />
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
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <FirebaseProvider>
              <AppProvider>
                <FirebaseErrorListener />
                {children}
                <Toaster />
              </AppProvider>
            </FirebaseProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
