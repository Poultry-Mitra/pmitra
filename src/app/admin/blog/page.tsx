
// src/app/admin/blog/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Loader2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePosts, deletePost } from "@/hooks/use-posts";
import type { Post } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase/provider";
import { format } from 'date-fns';

export default function AdminBlogPage() {
    const { posts, loading } = usePosts();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);

    const handleDelete = async () => {
        if (!postToDelete || !firestore) return;

        try {
            await deletePost(firestore, postToDelete.id);
            toast({
                title: "Post Deleted",
                description: `"${postToDelete.title}" has been successfully deleted.`,
                variant: "destructive"
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete post." });
        } finally {
            setPostToDelete(null);
        }
    };

    return (
        <>
            <PageHeader
                title="Blog Management"
                description="Create, edit, and manage all articles for the user-facing blog."
            >
                <Button asChild>
                    <Link href="/admin/blog/edit/new">
                        <PlusCircle className="mr-2" />
                        Create New Post
                    </Link>
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>All Blog Posts</CardTitle>
                        <CardDescription>A list of all published and draft articles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && posts && posts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No posts found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && posts && posts.map(post => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={post.isPublished ? "default" : "secondary"}>
                                                {post.isPublished ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{post.authorName}</TableCell>
                                        <TableCell>{format(new Date(post.createdAt), "dd MMM yyyy")}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/blog/edit/${post.id}`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setPostToDelete(post)}>
                                                        <Trash2 className="mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
             <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post
                             "{postToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
