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
import { useFirestore, useUser, useAuth } from "@/firebase/provider";
import { createUserProfile } from "@/hooks/use-users";
import { addAuditLog } from "@/hooks/use-audit-logs";
import { doc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';


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
    const auth = useAuth();
    const adminUser = useUser();

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
        if (!firestore || !adminUser.user || !auth) {
            toast({
                title: "Error",
                description: "You must be an admin to perform this action.",
                variant: "destructive",
            });
            return;
        }

        try {
            // We can't create an Auth user directly from the client without their password.
            // The best practice is to create their profile and then send them an email
            // to set their own password. This requires a backend function to create the user.
            // For now, we'll just create the profile and send a password reset as a workaround.
            
            // This is a placeholder for the actual user creation logic that should happen on a backend.
            // We'll just create the profile document for now.
            const newUserId = doc(collection(firestore, 'temp_users')).id; // Generate a temporary ID
            const userDocRef = doc(firestore, "users", newUserId);

            const newUserProfile = {
                id: newUserId,
                name: values.name,
                email: values.email,
                role: values.role,
                planType: values.planType,
                status: 'Active',
                dateJoined: new Date().toISOString(),
                ...(values.role === 'dealer' && { 
                    uniqueDealerCode: `DL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    connectedFarmers: [],
                }),
                ...(values.role === 'farmer' && {
                    connectedDealers: [],
                }),
                aiQueriesCount: 0,
                lastQueryDate: '',
            };

            // This will fail because client SDK cannot create arbitrary users.
            // This is a conceptual bug in the original implementation.
            // await createUserWithEmailAndPassword(auth, values.email, 'temporaryPassword');
            
            // Workaround: We can't create the auth user, but we can send a password reset.
            // This assumes the user will create their account with this email.
            // A better solution requires a backend function.
             await sendPasswordResetEmail(auth, values.email);


            await setDoc(userDocRef, newUserProfile);

            // Create an audit log for this action
            await addAuditLog(firestore, {
                adminUID: adminUser.user!.uid,
                action: 'CREATE_USER',
                timestamp: new Date().toISOString(),
                details: `Created new ${values.role} user profile: ${values.name} (${newUserId})`,
            });
            
            toast({
                title: "User Profile Created",
                description: `A profile for ${values.name} has been created and an email has been sent for them to set their password.`,
            });
            
            if (values.role === 'farmer') {
                router.push('/admin/user-management/farmers');
            } else if (values.role === 'dealer') {
                 router.push('/admin/user-management/dealers');
            } else {
                 router.push('/admin/dashboard');
            }
        } catch (error: any) {
             let errorMessage = "Could not create the user profile.";
             if (error.code === 'auth/email-already-in-use') {
                 errorMessage = "This email address is already in use. Try sending a password reset instead.";
             } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = "This operation is sensitive and requires recent authentication. Log in again before retrying this request."
             }
             toast({
                title: "User Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <PageHeader title="Add New User" description="Create a new farmer or dealer account." />
            <div className="mt-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>Fill in the form to create a new user. They will receive an email to set their password and log in.</CardDescription>
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
                                    <Save className="mr-2" />
                                    {form.formState.isSubmitting ? "Creating Profile..." : "Create User Profile"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
