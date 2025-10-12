// src/app/admin/user-management/add-user/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["farmer", "dealer"]),
  planType: z.enum(["free", "premium"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddUserPage() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "farmer",
            planType: "free",
        },
    });

    async function onSubmit(values: FormValues) {
        console.log("Creating new user:", values);
        // In a real app, this would create a new user document in Firestore and potentially an auth user.
        
        toast({
            title: "User Created",
            description: `${values.name} has been added as a new ${values.role}.`,
        });
        router.push(values.role === 'farmer' ? '/admin/user-management/farmers' : '/admin/user-management/dealers');
    }

    return (
        <>
            <PageHeader title="Add New User" description="Create a new farmer or dealer account." />
            <div className="mt-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>Fill in the form below to create a new user.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl><Input type="email" placeholder="e.g., user@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="farmer">Farmer</SelectItem>
                                                    <SelectItem value="dealer">Dealer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="planType"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Plan Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a plan" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="free">Free</SelectItem>
                                                    <SelectItem value="premium">Premium</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    <Save className="mr-2" />
                                    Create User
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}