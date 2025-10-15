// src/app/admin/blog/edit/[postId]/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from 'next/image';
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, AuthContext } from "@/firebase/provider";
import { usePost, addPost, updatePost } from "@/hooks/use-content";
import { Loader2, Save, WandSparkles, Upload } from "lucide-react";
import slugify from "slugify";
import { siteExpert } from "@/ai/flows/site-expert";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  featuredImageUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
  tags: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: adminUser } = useContext(AuthContext)!;
    
    const postId = params.postId === 'new' ? null : params.postId as string;
    const { post, loading: postLoading } = usePost(postId);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            featuredImageUrl: "",
            tags: "",
            isPublished: false,
        },
    });

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                content: post.content,
                featuredImageUrl: post.featuredImageUrl || "",
                tags: post.tags?.join(", ") || "",
                isPublished: post.isPublished,
            });
        }
    }, [post, form]);

    const handleGenerateContent = async () => {
        const title = form.getValues("title");
        if (!title || title.length < 10) {
            toast({
                title: "Title is too short",
                description: "Please provide a more descriptive title (at least 10 characters) for the AI to generate content.",
                variant: "destructive"
            });
            return;
        }

        setIsAiLoading(true);
        try {
            const result = await siteExpert({ query: `Write a detailed blog post about: ${title}` });
            form.setValue("content", result.answer, { shouldValidate: true });
        } catch (error) {
            console.error("AI content generation failed:", error);
            toast({
                title: "AI Assistant Failed",
                description: "Could not generate content at this time. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsAiLoading(false);
        }
    };


    async function onSubmit(values: FormValues) {
        if (!firestore || !adminUser) {
            toast({ title: "Error", description: "You must be an admin.", variant: "destructive" });
            return;
        }

        const postData = {
            title: values.title,
            slug: slugify(values.title, { lower: true, strict: true }),
            content: values.content,
            featuredImageUrl: values.featuredImageUrl,
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
    
    const imageUrl = form.watch("featuredImageUrl");

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
                                <CardDescription>Use markdown for formatting.</CardDescription>
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
                                    name="featuredImageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Featured Image URL</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-4">
                                                    <Input placeholder="https://picsum.photos/seed/1/800/400" {...field} />
                                                    {/* In a real app, this would be a proper file upload component */}
                                                    <Button type="button" variant="outline"><Upload className="mr-2"/> Upload</Button>
                                                </div>
                                            </FormControl>
                                            {imageUrl && (
                                                <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-md border">
                                                    <Image src={imageUrl} alt="Featured Image Preview" fill style={{objectFit: 'cover'}} />
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Main Content</FormLabel>
                                                <Button type="button" variant="outline" size="sm" onClick={handleGenerateContent} disabled={isAiLoading}>
                                                    {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <WandSparkles className="mr-2" />}
                                                    {isAiLoading ? "Generating..." : "AI Assistant"}
                                                </Button>
                                            </div>
                                            <FormControl><Textarea placeholder="Write your article here, or use the AI Assistant to generate a draft based on your title." {...field} rows={15} /></FormControl>
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
