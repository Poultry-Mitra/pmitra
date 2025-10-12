
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee } from "lucide-react";
import { currentDealer } from "@/lib/data";

function AdminSettings() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    };
    
    const handlePricingSave = () => {
        toast({
            title: "Pricing Updated",
            description: "Subscription plan prices have been saved.",
        });
    }

     return (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>App Configuration</CardTitle>
                    <CardDescription>Manage core features and default behaviors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="ai-chat" className="text-base">AI Chat</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable or disable the AI chat support feature for users.
                            </p>
                        </div>
                        <Switch id="ai-chat" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="payments" className="text-base">Payments</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable or disable subscription payments via Razorpay.
                            </p>
                        </div>
                        <Switch id="payments" defaultChecked />
                    </div>
                        <div className="space-y-2 rounded-lg border p-4">
                            <Label htmlFor="language" className="text-base">Default Language</Label>
                            <p className="text-sm text-muted-foreground pb-2">
                            Set the default language for new users and the login page.
                        </p>
                        <Select defaultValue="en">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 rounded-lg border p-4">
                        <Label htmlFor="support-email" className="text-base">Support Email & Contact</Label>
                        <p className="text-sm text-muted-foreground pb-2">
                            Contact information displayed to users for support queries.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Input id="support-email" defaultValue="support@poultrymitra.com" />
                            <Input id="support-phone" defaultValue="+91-80-1234-5678" />
                        </div>
                    </div>

                    <Button onClick={handleSave}>Save All Settings</Button>
                </CardContent>
            </Card>
                <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Configuration</CardTitle>
                        <CardDescription>Manage AI feature settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2 rounded-lg border p-4">
                            <Label htmlFor="ai-chat-limit" className="text-base">Monthly AI Chat Limit (Free Plan)</Label>
                            <p className="text-sm text-muted-foreground pb-2">
                                Set the number of free AI chat queries per month for users on the free plan.
                            </p>
                            <Input id="ai-chat-limit" type="number" defaultValue="5" className="w-[120px]" />
                        </div>
                        <Button onClick={handleSave} variant="secondary">Save AI Settings</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing Plan Management</CardTitle>
                        <CardDescription>Update subscription prices.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Farmer Plan</h4>
                            <div className="space-y-2">
                                <Label htmlFor="farmer-monthly">Monthly Price (₹)</Label>
                                <Input id="farmer-monthly" type="number" defaultValue="249" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="farmer-yearly">Yearly Price (₹)</Label>
                                <Input id="farmer-yearly" type="number" defaultValue="2499" />
                            </div>
                        </div>
                            <div className="space-y-4">
                            <h4 className="font-medium text-sm">Dealer Plan</h4>
                            <div className="space-y-2">
                                <Label htmlFor="dealer-monthly">Monthly Price (₹)</Label>
                                <Input id="dealer-monthly" type="number" defaultValue="499" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dealer-yearly">Yearly Price (₹)</Label>
                                <Input id="dealer-yearly" type="number" defaultValue="4999" />
                            </div>
                        </div>
                        <Button onClick={handlePricingSave} variant="secondary" className="w-full">
                            <IndianRupee className="mr-2"/>
                            Save Pricing
                        </Button>
                    </CardContent>
                </Card>
                </div>
        </div>
    )
}

function DealerSettings() {
    const { toast } = useToast();
    const dealer = currentDealer;

    const handleProfileSave = () => {
        toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    };

    if (!dealer) return null;
    
    return (
         <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal information and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={dealer?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={dealer?.email} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Unique Dealer Code</Label>
                        <Input readOnly disabled value={dealer?.uniqueDealerCode} />
                         <p className="text-sm text-muted-foreground">Share this code with farmers to let them connect with you.</p>
                    </div>
                     <Button onClick={handleProfileSave}>Save Profile</Button>
                </CardContent>
            </Card>
         </div>
    )
}


export default function SettingsPage() {
    const currentUser = currentDealer;
    const isAdmin = currentUser?.role === 'admin';
    const pageTitle = isAdmin ? "System Settings" : "My Profile & Settings";
    const pageDescription = isAdmin ? "Configure global application settings." : "Manage your account and preferences.";

    return (
        <>
            <PageHeader title={pageTitle} description={pageDescription} />
            <div className="mt-8">
                {isAdmin ? <AdminSettings /> : <DealerSettings />}
            </div>
        </>
    );
}
