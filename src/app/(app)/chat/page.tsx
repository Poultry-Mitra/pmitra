
// src/app/(app)/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { PageHeader } from "../_components/page-header";
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, WandSparkles } from 'lucide-react';
import { AppIcon } from '@/app/icon-component';
import { siteExpertAction } from '@/app/ai/actions';
import { useAppUser } from '@/app/app-provider';
import { useLanguage } from '@/components/language-provider';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAppUser();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const userName = user?.name || 'User';

  const suggestedQuestions = [
    t('chat_suggestions.what_is_broiler'),
    t('chat_suggestions.reduce_mortality'),
    t('chat_suggestions.what_is_fcr'),
    t('chat_suggestions.why_biosecurity'),
  ];

   useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);


  const handleSubmit = async (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const currentQuery = query || input;
    if (!currentQuery.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), text: currentQuery, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    
    if (!query) {
        setInput('');
    }
    setLoading(true);

    try {
      const result = await siteExpertAction({ query: currentQuery });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: result.answer, sender: 'ai' };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI query failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, but I'm having trouble connecting. Please try again later.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <PageHeader 
            title="AI Chat"
            description="Your personal poultry farming expert. Ask me anything!"
        />
        <div className="mt-8">
            <Card className="flex flex-col h-[70vh]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <WandSparkles className="text-primary" />
                AI Poultry Expert
                </CardTitle>
                <CardDescription>Ask questions in English or Hindi.</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {messages.length === 0 && !loading && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="size-8 border">
                                <div className="flex h-full w-full items-center justify-center bg-primary">
                                    <AppIcon className="size-5 text-primary-foreground"/>
                                </div>
                            </Avatar>
                            <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-secondary space-y-3">
                                <p className="whitespace-pre-wrap">Welcome! How can I help you today?</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {suggestedQuestions.map(q => (
                                        <Button
                                            key={q}
                                            variant="outline"
                                            size="sm"
                                            className="bg-background h-auto text-wrap text-left justify-start"
                                            onClick={(e) => handleSubmit(e, q)}
                                        >
                                            {q}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {messages.map((message) => (
                        <div
                        key={message.id}
                        className={cn(
                            "flex items-start gap-3",
                            message.sender === "user" ? "justify-end" : "justify-start"
                        )}
                        >
                        {message.sender === "ai" && (
                            <Avatar className="size-8 border">
                            <div className="flex h-full w-full items-center justify-center bg-primary">
                                <AppIcon className="size-5 text-primary-foreground"/>
                            </div>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            "max-w-2xl rounded-lg px-4 py-3 text-sm",
                            message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            )}
                        >
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                        {message.sender === "user" && (
                            <Avatar className="size-8">
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="size-8 border">
                                <div className="flex h-full w-full items-center justify-center bg-primary">
                                    <AppIcon className="size-5 text-primary-foreground"/>
                                </div>
                            </Avatar>
                            <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-secondary">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0.2s]"></span>
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <CardFooter className="border-t pt-6">
                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about broiler breeds, disease prevention, feed types..."
                    disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                    <Send className="size-4" />
                </Button>
                </form>
            </CardFooter>
            </Card>
        </div>
    </>
  );
}
