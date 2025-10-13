
// src/app/(app)/blog/[slug]/page.tsx
"use client";

import { useParams, notFound, useRouter } from "next/navigation";
import { usePostBySlug } from "@/hooks/use-posts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Calendar, User, Share2, Link as LinkIcon, Twitter } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "../../_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simple WhatsApp icon SVG
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-message-circle"
  >
    <path d="M12.04 2a10 10 0 0 0-9.95 9.1c0 1.75.45 3.42 1.25 4.9L2 22l5.2-1.4A9.9 9.9 0 0 0 12.04 22a10 10 0 0 0 10-10 10 10 0 0 0-10-10Z" />
    <path d="M7.63 10.43c.1-.25.46-.38.7-.38.21 0 .42.02.6.05.23.04.38.3.3.55l-.17 1.41a.4.4 0 0 1-.39.39l-1.4.17c-.24.03-.5-.12-.55-.37-.03-.18-.05-.38-.05-.6 0-.22.02-.43.06-.63Z" />
    <path d="m15.5 15.1-1.3-2.5a.46.46 0 0 0-.81-.15l-1.1 1.7a.27.27 0 0 1-.45-.15l-.4-2.1a.33.33 0 0 0-.4-.3l-2.04.4a.2.2 0 0 0-.16.2L9.2 16.2a1.6 1.6 0 0 0 1.6 1.6l4.4-.8a1.88 1.88 0 0 0 1.4-2.2l-1.1-1.7Z" />
  </svg>
);


export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params.slug as string;
    const { post, loading } = usePostBySlug(slug);

    if (loading) {
        return (
            <div className="container max-w-3xl py-8">
                <Skeleton className="h-12 w-3/4" />
                <div className="mt-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="mt-8 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
        );
    }

    if (!post) {
        notFound();
    }
    
    const postUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        toast({ title: "Link Copied!", description: "The article link has been copied to your clipboard." });
    };

    const handleShare = (platform: 'twitter' | 'whatsapp') => {
        const text = encodeURIComponent(`Check out this article from PoultryMitra: "${post.title}"`);
        let url = '';
        if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(postUrl)}`;
        } else if (platform === 'whatsapp') {
            url = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(postUrl)}`;
        }
        window.open(url, '_blank');
    };

    return (
        <div className="container max-w-4xl py-8">
            <article>
                <header className="space-y-4">
                    <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{post.authorName}</span>
                        </div>
                        <span className="hidden sm:inline text-muted-foreground/50">|</span>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.createdAt}>
                                {format(new Date(post.createdAt), "MMMM d, yyyy")}
                            </time>
                        </div>
                        <div className="ml-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleCopyLink}>
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        Copy Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                                        <Twitter className="mr-2 h-4 w-4" />
                                        Share on Twitter
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                                        <WhatsAppIcon />
                                        <span className="ml-2">Share on WhatsApp</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>
                
                <Card className="mt-8">
                    <CardContent className="pt-6">
                        <div 
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                        />
                    </CardContent>
                </Card>
            </article>
        </div>
    );
}

