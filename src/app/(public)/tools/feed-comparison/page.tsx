// src/app/(public)/tools/feed-comparison/page.tsx
"use client";

import { PageHeader } from "@/app/(public)/_components/page-header";
import { FeedComparisonCalculator } from "@/app/_components/feed-comparison-calculator";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function FeedComparisonPage() {
    return (
        <div className="container py-12">
            <PageHeader
                title="Feed Comparison Calculator"
                description="Compare feed brands by price and nutrition to find the best value."
            />
             <div className="mt-8 max-w-4xl mx-auto">
                <Alert variant="destructive" className="mb-6 bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>चेतावनी (Warning)</AlertTitle>
                    <AlertDescription>
                        यह केवल एक अनुमान है और 100% सटीक नहीं हो सकता है। कृपया अपने निर्णय के लिए पेशेवर सलाह भी लें।
                    </AlertDescription>
                </Alert>
                <FeedComparisonCalculator />
            </div>
        </div>
    );
}
