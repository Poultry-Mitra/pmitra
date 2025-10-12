// src/app/admin/user-management/farmers/page.tsx
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { UserManagementSummary } from "@/app/admin/_components/user-management-summary";
import { useLanguage } from "@/components/language-provider";

export default function AllFarmersPage() {
    const { t } = useLanguage();
    return (
        <>
            <PageHeader
                title={t('admin.farmers_page.title')}
                description={t('admin.farmers_page.description')}
            />
            <div className="mt-8">
                <UserManagementSummary roleToShow="farmer" />
            </div>
        </>
    );
}
