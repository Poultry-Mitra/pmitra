
import { PageHeader } from "@/components/ui/page-header";
import { FeedRecommendationForm } from "./_components/feed-form";

export default function FeedRecommendationPage() {
  return (
    <>
      <PageHeader 
        title="AI Feed Recommendation"
        description="Fill in your farm's current data to receive an AI-powered feed recommendation."
      />
      <div className="mt-8">
        <FeedRecommendationForm />
      </div>
    </>
  );
}
