// src/app/(app)/chat/page.tsx

import { PageHeader } from "../_components/page-header";
import { ChatLayout } from "./_components/chat-layout";
import { useLanguage } from "@/components/language-provider";

export default function ChatPage() {
  const { t } = useLanguage();
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
       <PageHeader 
        title={t('ai_chat.title')} 
        description="Ask our AI assistant anything about poultry farming."
       />
       <div className="mt-8 flex-1">
        <ChatLayout />
       </div>
    </div>
  );
}
