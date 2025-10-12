// src/app/admin/user-management/farmers/page.tsx
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { UserManagementSummary } from "@/app/admin/_components/user-management-summary";

export default function AllFarmersPage() {
    return (
        <>
            <PageHeader
                title="Farmer Management"
                description="View, manage, and search all farmer accounts."
            />
            <div className="mt-8">
                <UserManagementSummary roleToShow="farmer" />
            </div>
        </>
    );
}