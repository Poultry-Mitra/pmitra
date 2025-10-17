// src/app/(app)/diagnose-health/page.tsx
import { PageHeader } from "@/app/(app)/diagnose-health/_components/page-header";
import { SymptomChecker } from "./_components/symptom-checker";

export default function DiagnoseHealthPage() {
  return (
    <>
      <PageHeader 
        title="AI Health Diagnosis"
        description="Use our AI tool to diagnose potential health issues in your flock. Select symptoms and upload a photo for a detailed analysis."
      />
      <div className="mt-8">
        <SymptomChecker />
      </div>
    </>
  );
}
