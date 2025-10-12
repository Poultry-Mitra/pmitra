
import { PageHeader } from "../_components/page-header";
import { ChatLayout } from "./_components/chat-layout";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
       <PageHeader 
        title="AI Chat Support" 
        description="Ask our AI assistant anything about poultry farming."
       />
       <div className="mt-8 flex-1">
        <ChatLayout />
       </div>
    </div>
  );
}
