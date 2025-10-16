// src/app/diagnose-health/page.tsx
import { PageHeader } from "./_components/page-header";
import { SymptomChecker } from "./_components/symptom-checker";
import { LanguageProvider } from '@/components/language-provider';

export default function DiagnoseHealthPage() {
    return (
        <LanguageProvider>
            <div className="container mx-auto py-8">
                <PageHeader 
                    title="AI Health Diagnosis"
                    description="Use our AI-powered tool to check for potential diseases in your flock based on observed symptoms."
                />
                <div className="mt-8">
                    <SymptomChecker />
                </div>
            </div>
        </LanguageProvider>
    )
}
