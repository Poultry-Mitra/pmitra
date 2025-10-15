
// src/app/blog/[slug]/page.tsx
"use client";

import { useParams, notFound } from "next/navigation";
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePostBySlug } from "@/hooks/use-posts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Calendar, Share2, Link as LinkIcon, Twitter } from "lucide-react";
import { format } from "date-fns";
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
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="size-4"
      fill="currentColor"
    >
      <title>WhatsApp</title>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.816-.916-.816-.52.05-.717.05c-.197 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 5.451 0 9.885 4.434 9.889 9.884-.001 5.45-4.438 9.884-9.889 9.884m0-21.783c-6.525 0-11.832 5.307-11.832 11.831 0 2.052.53 4.005 1.511 5.74l-1.581 5.762 5.898-1.551a11.835 11.835 0 005.004 1.503h.005c6.527 0 11.83-5.307 11.83-11.831 0-6.525-5.303-11.832-11.829-11.832Z"></path>
    </svg>
);


export default function BlogPostPage() {
    const params = useParams();
    const { toast } = useToast();
    const slug = params.slug as string;
    const { post, loading } = usePostBySlug(slug);

    if (loading) {
        return (
            <div className="container max-w-4xl py-8">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-12 w-3/4" />
                <div className="mt-6 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="mt-8 aspect-video w-full" />
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
                
                {post.featuredImageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg mt-8 border">
                        <Image src={post.featuredImageUrl} alt={post.title} fill style={{objectFit: 'cover'}}/>
                    </div>
                )}

                <div className="mt-8">
                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </article>
        </div>
    );
}
