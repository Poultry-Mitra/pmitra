
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DealersPage() {
  return (
    <>
      <PageHeader 
        title="Dealers"
        description="Manage your connections with dealers."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Connect Dealer
        </Button>
      </PageHeader>
      <div className="mt-8">
        <p className="text-muted-foreground">A list of connected dealers will be displayed here. Farmers can enter a dealer's PoultryMitra ID to connect. Free users are limited to 1 dealer connection.</p>
      </div>
    </>
  );
}
