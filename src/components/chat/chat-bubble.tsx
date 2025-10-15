'use client';

import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from './chat-provider';

export function ChatBubble() {
  const { isOpen, setIsOpen } = useChat();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat widget"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
