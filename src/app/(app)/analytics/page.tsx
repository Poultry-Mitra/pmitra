
import { PageHeader } from "../_components/page-header";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader 
        title="Analytics"
        description="Detailed analytics and reports for your farm."
      />
      <div className="mt-8">
        <p className="text-muted-foreground">Analytics content will be displayed here. Premium users will see advanced charts and have the ability to export data.</p>
      </div>
    </>
  );
}
