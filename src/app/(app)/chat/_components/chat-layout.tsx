
"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiQueryPoultry } from "@/ai/flows/ai-query-poultry";
import { AppIcon } from "@/app/icon-component";
import { useUser, useFirestore } from "@/firebase/provider";
import { doc, getDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

const AI_QUERY_LIMIT = 5;

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firebaseUser = useUser();
  const firestore = useFirestore();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (firebaseUser && firestore) {
      setUserLoading(true);
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setAppUser({ id: docSnap.id, ...docSnap.data() } as AppUser);
        } else {
          setAppUser(null);
        }
        setUserLoading(false);
      });
      return () => unsubscribe();
    } else {
        setUserLoading(false);
    }
  }, [firebaseUser, firestore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !appUser || !firestore) return;

    // Check AI query limit for free users
    if (appUser.planType === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastQueryMonth = appUser.lastQueryDate?.slice(0, 7);
      const queriesThisMonth = lastQueryMonth === currentMonth ? (appUser.aiQueriesCount || 0) : 0;

      if (queriesThisMonth >= AI_QUERY_LIMIT) {
        toast({
          title: "AI Chat Limit Reached",
          description: "You have used all your free AI queries for this month. Please upgrade to Premium for unlimited access.",
          variant: "destructive",
          action: <Button asChild size="sm" variant="secondary"><Link href="/pricing">Upgrade</Link></Button>
        });
        return;
      }
    }

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await aiQueryPoultry({ query: input });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: result.answer, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);

      // Update user's query count in Firestore
       if (appUser.planType === 'free') {
          const userDocRef = doc(firestore, 'users', appUser.id);
          const currentMonth = new Date().toISOString().slice(0, 7);
          
          let updatedCount;

          if (appUser.lastQueryDate?.slice(0, 7) === currentMonth) {
              await updateDoc(userDocRef, { aiQueriesCount: increment(1), lastQueryDate: new Date().toISOString() });
              updatedCount = (appUser.aiQueriesCount || 0) + 1;
          } else {
              // Reset count for the new month
              await updateDoc(userDocRef, {
                  aiQueriesCount: 1,
                  lastQueryDate: new Date().toISOString()
              });
              updatedCount = 1;
          }

           // Optimistically update local state to enforce limit immediately
           setAppUser(prevUser => prevUser ? { ...prevUser, aiQueriesCount: updatedCount, lastQueryDate: new Date().toISOString() } : null);
      }

    } catch (error) {
      console.error("AI query failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, but I'm having trouble connecting. Please try again later.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  if (userLoading) {
      return (
          <div className="h-full flex flex-col rounded-lg border bg-card p-4 space-y-4">
              <Skeleton className="flex-1" />
              <div className="flex gap-2">
                  <Skeleton className="flex-1 h-10" />
                  <Skeleton className="size-10" />
              </div>
          </div>
      )
  }
  const userName = appUser?.name || 'User';

  const queriesUsed = (appUser?.lastQueryDate?.slice(0,7) === new Date().toISOString().slice(0,7)) ? (appUser?.aiQueriesCount || 0) : 0;

  return (
    <div className="h-full flex flex-col rounded-lg border bg-card">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <WandSparkles className="size-16 mb-4 text-primary"/>
                <h3 className="font-headline text-lg font-semibold text-foreground">Welcome to AI Chat</h3>
                <p>Ask me about feed types, disease symptoms, or best practices for poultry farming.</p>
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
                  "max-w-md rounded-lg px-4 py-3 text-sm",
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
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about anything poultry-related..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
         {appUser?.planType === 'free' && (
             <div className="text-xs text-muted-foreground mt-2 text-center">
                 Queries used this month: {queriesUsed} / {AI_QUERY_LIMIT}
            </div>
         )}
      </div>
    </div>
  );
}

    
