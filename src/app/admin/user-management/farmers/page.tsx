
import { PageHeader } from "@/app/(app)/_components/page-header";
import { UserManagementSummary } from "../../_components/user-management-summary";

export default function FarmersPage() {
    return (
        <>
            <PageHeader title="Farmer Management" description="View and manage all farmers." />
            <div className="mt-8">
                <UserManagementSummary />
            </div>
        </>
    )
}
