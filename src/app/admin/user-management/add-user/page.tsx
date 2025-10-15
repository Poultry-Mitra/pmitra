
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
import { Save, Send } from "lucide-react";
import { useFirestore, AuthContext } from "@/firebase/provider";
import { addAuditLog } from "@/hooks/use-audit-logs";
import { collection, addDoc } from 'firebase/firestore';
import { useContext } from "react";


const formSchema = z.object({
  name: z.string().min(3, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["farmer", "dealer", "admin"]),
  planType: z.enum(["free", "premium"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddUserPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user: adminUser } = useContext(AuthContext)!;

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
        if (!firestore || !adminUser) {
            toast({
                title: "Error",
                description: "You must be an admin to perform this action.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Create an invitation document instead of a user profile
            const invitationRef = collection(firestore, "invitations");
            
            await addDoc(invitationRef, {
                email: values.email,
                name: values.name,
                role: values.role,
                planType: values.planType,
                status: 'pending',
                createdAt: new Date().toISOString(),
                createdBy: adminUser.uid,
            });

            // Create an audit log for this action
            await addAuditLog(firestore, {
                adminUID: adminUser.uid,
                action: 'CREATE_USER', // We'll keep the action name for consistency
                details: `Sent invitation to ${values.email} for role: ${values.role}.`,
            });
            
            toast({
                title: "Invitation Created",
                description: `An invitation has been created for ${values.email}. Please share the sign-up link with them.`,
            });
            
            // Redirect based on role
            const redirectPath = values.role === 'farmer' ? '/admin/user-management/farmers' : '/admin/user-management/dealers';
            router.push(redirectPath);

        } catch (error: any) {
             toast({
                title: "Invitation Failed",
                description: error.message || "Could not create the invitation.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <PageHeader title="Invite New User" description="Invite a new farmer or dealer to the platform." />
            <div className="mt-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>
                            Fill in the user's details. An invitation will be generated for them to create their account. This does not create a user directly.
                        </CardDescription>
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
                                                    <SelectItem value="admin">Admin</SelectItem>
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
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    <Send className="mr-2" />
                                    {form.formState.isSubmitting ? "Creating Invitation..." : "Create Invitation"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
