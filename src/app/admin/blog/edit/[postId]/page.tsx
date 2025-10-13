
// src/app/admin/blog/edit/[postId]/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase/provider";
import { usePost, addPost, updatePost } from "@/hooks/use-posts";
import { Loader2, Save } from "lucide-react";
import slugify from "slugify";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  tags: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: adminUser } = useUser();
    
    const postId = params.postId === 'new' ? null : params.postId as string;
    const { post, loading: postLoading } = usePost(postId);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: "",
            isPublished: false,
        },
    });

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                content: post.content,
                tags: post.tags?.join(", ") || "",
                isPublished: post.isPublished,
            });
        }
    }, [post, form]);

    async function onSubmit(values: FormValues) {
        if (!firestore || !adminUser) {
            toast({ title: "Error", description: "You must be an admin.", variant: "destructive" });
            return;
        }

        const postData = {
            title: values.title,
            slug: slugify(values.title, { lower: true, strict: true }),
            content: values.content,
            tags: values.tags?.split(",").map(tag => tag.trim()).filter(Boolean) || [],
            isPublished: values.isPublished,
            authorId: adminUser.uid,
            authorName: adminUser.displayName || adminUser.email || "Admin",
        };

        try {
            if (postId) {
                await updatePost(firestore, postId, postData);
                toast({ title: "Post Updated", description: "Your changes have been saved." });
            } else {
                await addPost(firestore, postData);
                toast({ title: "Post Created", description: "The new post has been saved." });
            }
            router.push('/admin/blog');
        } catch (error) {
            console.error("Error saving post:", error);
            toast({ title: "Error", description: "Failed to save the post.", variant: "destructive" });
        }
    }

    if (postLoading && postId) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <>
            <PageHeader
                title={postId ? "Edit Post" : "Create New Post"}
                description="Write and publish a new article for the blog."
            />
            <div className="mt-8 max-w-4xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Content</CardTitle>
                                <CardDescription>Use markdown for formatting. Images are not yet supported.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Post Title</FormLabel>
                                            <FormControl><Input placeholder="A catchy title for your article" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Main Content</FormLabel>
                                            <FormControl><Textarea placeholder="Write your article here..." {...field} rows={15} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Publishing</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                 <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl><Input placeholder="e.g., feed, health, broiler" {...field} /></FormControl>
                                            <FormDescription>Separate tags with a comma.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isPublished"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Publish Post</FormLabel>
                                                <FormDescription>
                                                    Once published, this post will be visible to all users.
                                                </FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                             </CardContent>
                        </Card>

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            <Save className="mr-2" />
                            {form.formState.isSubmitting ? "Saving..." : (postId ? "Save Changes" : "Publish Post")}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
}

// Minimal slugify function, you might want a more robust library like 'slugify'
function toSlug(str: string) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
