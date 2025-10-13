
// src/app/(app)/blog/[slug]/page.tsx
"use client";

import { useParams, notFound } from "next/navigation";
import { usePostBySlug } from "@/hooks/use-posts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "../../_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostPage() {
    const params = useParams();
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
    
    return (
        <div className="container max-w-3xl py-8">
            <article>
                <header className="space-y-4">
                    <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{post.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{post.authorName}</span>
                        </div>
                        <span className="text-muted-foreground/50">|</span>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.createdAt}>
                                {format(new Date(post.createdAt), "MMMM d, yyyy")}
                            </time>
                        </div>
                    </div>
                </header>
                
                <Card className="mt-8">
                    <CardContent className="pt-6">
                        <div 
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} // Simple conversion for now
                        />
                    </CardContent>
                </Card>
            </article>
        </div>
    );
}

