

"use client";

import { useState } from "react";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

function AdminSettings() {
    const { toast } = useToast();
    const [aiChatEnabled, setAiChatEnabled] = useState(true);
    const [paymentsEnabled, setPaymentsEnabled] = useState(true);

    const handleSave = () => {
        // In a real app, this would write to a `/settings/app` document in Firestore.
        console.log({
            aiChatEnabled,
            paymentsEnabled,
            // other settings...
        });
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    };
    
    return (
        <div className="grid gap-8">
            <Card>
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
                        <Switch id="ai-chat" checked={aiChatEnabled} onCheckedChange={setAiChatEnabled} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="payments" className="text-base">Payments</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable or disable subscription payments via Razorpay.
                            </p>
                        </div>
                        <Switch id="payments" checked={paymentsEnabled} onCheckedChange={setPaymentsEnabled} />
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
                     <div className="space-y-2 rounded-lg border p-4">
                        <Label htmlFor="ai-chat-limit" className="text-base">Monthly AI Chat Limit (Free Plan)</Label>
                        <p className="text-sm text-muted-foreground pb-2">
                            Set the number of free AI chat queries per month for users on the free plan.
                        </p>
                        <Input id="ai-chat-limit" type="number" defaultValue="5" className="w-[120px]" />
                    </div>

                    <Button onClick={handleSave}>Save Settings</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SettingsPage() {
    const pageTitle = "App Settings";
    const pageDescription = "Configure global application settings and features.";

    return (
        <>
            <PageHeader title={pageTitle} description={pageDescription} />
            <div className="mt-8">
                <AdminSettings />
            </div>
        </>
    );
}
