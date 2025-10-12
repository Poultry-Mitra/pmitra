

"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    };

    return (
        <>
            <PageHeader title="System Settings" description="Configure global application settings." />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Configuration</CardTitle>
                        <CardDescription>Manage AI feature settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2 rounded-lg border p-4">
                             <Label htmlFor="language" className="text-base">Monthly AI Chat Limit (Free Plan)</Label>
                             <p className="text-sm text-muted-foreground pb-2">
                                Set the number of free AI chat queries per month for users on the free plan.
                            </p>
                             <Input id="ai-chat-limit" type="number" defaultValue="5" className="w-[120px]" />
                        </div>
                        <Button onClick={handleSave} variant="secondary">Save AI Settings</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
