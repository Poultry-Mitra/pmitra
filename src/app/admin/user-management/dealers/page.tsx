

import { PageHeader } from "@/app/admin/_components/page-header";
import { UserManagementSummary } from "../../_components/user-management-summary";

export default function DealersPage() {
    return (
        <>
            <PageHeader title="Dealer Management" description="View and manage all dealers." />
            <div className="mt-8">
                <UserManagementSummary roleToShow="dealer" />
            </div>
        </>
    )
}
