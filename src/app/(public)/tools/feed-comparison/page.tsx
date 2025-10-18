// src/app/(public)/tools/feed-comparison/page.tsx
"use client";

import { FeedComparisonCalculator } from "@/app/_components/feed-comparison-calculator";
import { ToolPageLayout } from "../_components/tool-page-layout";

export default function FeedComparisonPage() {
    return (
        <ToolPageLayout
            title="Feed Comparison Calculator"
            description="Compare feed brands by price and nutrition to find the best value."
        >
            <FeedComparisonCalculator />
        </ToolPageLayout>
    );
}
