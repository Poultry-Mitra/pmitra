
// src/app/admin/user-management/dealers/page.tsx
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { UserManagementSummary } from "@/app/admin/_components/user-management-summary";
import { useLanguage } from "@/components/language-provider";

export default function AllDealersPage() {
    const { t } = useLanguage();
    return (
        <>
            <PageHeader
                title={t('admin.dealers_page.title')}
                description={t('admin.dealers_page.description')}
            />
            <div className="mt-8">
                <UserManagementSummary roleToShow="dealer" />
            </div>
        </>
    );
}
