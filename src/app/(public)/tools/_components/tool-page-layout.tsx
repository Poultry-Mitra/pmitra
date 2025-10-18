// src/app/(public)/tools/_components/tool-page-layout.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/app/(public)/_components/page-header';
import { useAppUser } from '@/app/app-provider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ToolPageLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export function ToolPageLayout({ title, description, children }: ToolPageLayoutProps) {
    const { user } = useAppUser();

    return (
        <div className="container py-12">
            <PageHeader title={title} description={description} />
            <div className="mt-8 max-w-4xl mx-auto">
                <Alert variant="destructive" className="mb-6 bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>चेतावनी (Warning)</AlertTitle>
                    <AlertDescription>
                        यह केवल एक अनुमान है और 100% सटीक नहीं हो सकता है। कृपया अपने निर्णय के लिए पेशेवर सलाह भी लें।
                    </AlertDescription>
                </Alert>
                
                {children}
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/tools"><ArrowLeft className="mr-2" /> Go back to Tools</Link>
                    </Button>
                    {user && (
                        <Button asChild>
                            <Link href="/dashboard"><LayoutDashboard className="mr-2" /> Go to Dashboard</Link>
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href="/"><ArrowLeft className="mr-2" /> Go back to Homepage</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}