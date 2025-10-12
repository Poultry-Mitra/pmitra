
"use client";

import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    message: z.string().min(10, "Message must be at least 10 characters."),
    recipientGroup: z.enum(["all", "farmers", "dealers"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function NotificationsPage() {
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            message: "",
            recipientGroup: "all",
        },
    });

    function onSubmit(values: FormValues) {
        console.log(values);
        toast({
            title: "Notification Sent",
            description: `Notification titled "${values.title}" sent to ${values.recipientGroup} users.`,
        });
        form.reset();
    }

    return (
        <>
            <PageHeader title="Send Notification" description="Broadcast messages to user groups." />
            <div className="mt-8 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Compose Message</CardTitle>
                        <CardDescription>Create and send a notification to a selected group of users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="recipientGroup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recipient Group</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a group" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">All Users</SelectItem>
                                                    <SelectItem value="farmers">Farmers Only</SelectItem>
                                                    <SelectItem value="dealers">Dealers Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notification Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Upcoming Maintenance" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter your notification message here..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit">Send Notification</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
