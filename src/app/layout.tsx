
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Space_Grotesk, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/app/app-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseProvider } from '@/firebase/provider';
import { ChatProvider } from '@/components/chat/chat-provider';
import { FloatingChatWidget } from '@/components/chat/floating-chat-widget';

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const fontPtSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
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
      </head>
      <body 
        className={cn(
          "font-body antialiased",
          fontSpaceGrotesk.variable,
          fontPtSans.variable
        )}
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
                  <ChatProvider>
                    <FirebaseErrorListener />
                    {children}
                    <FloatingChatWidget />
                  </ChatProvider>
                </AppProvider>
            </FirebaseProvider>
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
