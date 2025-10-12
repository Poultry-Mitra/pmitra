
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


export const metadata: Metadata = {
  title: 'PoultryMitra - Your AI-Powered Poultry Farming Assistant',
  description: 'Leverage AI to optimize your poultry farm with data analytics, real-time monitoring, and expert support.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
            <FirebaseClientProvider>
                {children}
                <Toaster />
                <FirebaseErrorListener />
            </FirebaseClientProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

