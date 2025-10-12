
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function BatchesPage() {
  return (
    <>
      <PageHeader 
        title="My Batches"
        description="Manage all your poultry batches in one place."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Add New Batch
        </Button>
      </PageHeader>
      <div className="mt-8">
        <p className="text-muted-foreground">A table of all active and completed batches will be displayed here. Free users will be limited to 1 active batch.</p>
      </div>
    </>
  );
}
