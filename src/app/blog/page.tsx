
// src/app/blog/page.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePosts } from "@/hooks/use-posts";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/(app)/_components/page-header";

export default function BlogPage() {
    const { posts, loading } = usePosts();
    const publishedPosts = posts?.filter(p => p.isPublished) || [];

    return (
        <div className="container py-8">
            <PageHeader
                title="Poultry Guide & Blog"
                description="Expert articles, tips, and insights to help you succeed in poultry farming."
            />
            <div className="mt-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : publishedPosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No articles published yet. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedPosts.map(post => (
                            <Card key={post.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                    <CardDescription>
                                        By {post.authorName} on {format(new Date(post.createdAt), "MMM d, yyyy")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {post.content.substring(0, 150).replace(/<[^>]*>?/gm, '')}...
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {post.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" asChild>
                                        <Link href={`/blog/${post.slug}`}>
                                            Read More <ArrowRight className="ml-2" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
