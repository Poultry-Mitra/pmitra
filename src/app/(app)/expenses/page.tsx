
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ExpensesPage() {
  return (
    <>
      <PageHeader 
        title="Expenses"
        description="Track your farm's expenses for feed, medicine, and more."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Add Expense
        </Button>
      </PageHeader>
      <div className="mt-8">
        <p className="text-muted-foreground">A list or chart of expenses will be displayed here. Farmers can add expenses and view breakdowns by category. Premium users can export reports.</p>
      </div>
    </>
  );
}
