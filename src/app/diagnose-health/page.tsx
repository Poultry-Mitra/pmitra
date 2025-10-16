// src/app/diagnose-health/page.tsx
import { PageHeader } from "./_components/page-header";
import { SymptomChecker } from "./_components/symptom-checker";

export default function DiagnoseHealthPage() {
    return (
        <>
            <PageHeader 
                title="AI Health Diagnosis"
                description="Use our AI-powered tool to check for potential diseases in your flock based on observed symptoms."
            />
            <div className="mt-8">
                <SymptomChecker />
            </div>
        </>
    )
}
