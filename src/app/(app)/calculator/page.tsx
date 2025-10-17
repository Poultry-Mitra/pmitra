// src/app/(app)/calculator/page.tsx
import { BroilerCalculator } from "@/app/_components/broiler-calculator";
import { PageHeader } from "../_components/page-header";

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="Broiler Farm Calculator"
        description="Estimate your costs and profits for a 45-day broiler cycle."
      />
      <div className="mt-8">
        <BroilerCalculator />
      </div>
    </>
  );
}
