// src/app/admin/user-management/dealers/page.tsx
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { UserManagementSummary } from "@/app/admin/_components/user-management-summary";

export default function AllDealersPage() {
    return (
        <>
            <PageHeader
                title="Dealer Management"
                description="View, manage, and search all dealer accounts."
            />
            <div className="mt-8">
                <UserManagementSummary roleToShow="dealer" />
            </div>
        </>
    );
}