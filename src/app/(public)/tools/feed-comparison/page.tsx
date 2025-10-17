// src/app/(public)/tools/feed-comparison/page.tsx
"use client";

import { PageHeader } from "@/app/_components/page-header";
import { FeedComparisonCalculator } from "@/app/_components/feed-comparison-calculator";

export default function FeedComparisonPage() {
    return (
        <div className="container py-12">
            <PageHeader
                title="Feed Comparison Calculator"
                description="Compare feed brands by price and nutrition to find the best value."
            />
            <div className="mt-8">
                <FeedComparisonCalculator />
            </div>
        </div>
    );
}
