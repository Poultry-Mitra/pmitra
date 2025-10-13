

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

             <Card>
                <CardHeader>
                    <CardTitle>Payment Gateway Settings</CardTitle>
                    <CardDescription>Configure payment providers like Razorpay, Paytm, or manual UPI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="razorpay">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
                            <TabsTrigger value="paytm">Paytm</TabsTrigger>
                            <TabsTrigger value="phonepe">PhonePe</TabsTrigger>
                            <TabsTrigger value="manual">Manual (QR/UPI)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="razorpay" className="mt-6">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="razorpay-enabled" className="text-base">Enable Razorpay</Label>
                                    <Switch id="razorpay-enabled" defaultChecked />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="razorpay-key-id">Key ID</Label>
                                    <Input id="razorpay-key-id" placeholder="rzp_live_..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="razorpay-key-secret">Key Secret</Label>
                                    <Input id="razorpay-key-secret" type="password" placeholder="••••••••••••" />
                                </div>
                            </div>
                        </TabsContent>
                         <TabsContent value="paytm" className="mt-6">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="paytm-enabled" className="text-base">Enable Paytm</Label>
                                    <Switch id="paytm-enabled" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paytm-merchant-id">Merchant ID</Label>
                                    <Input id="paytm-merchant-id" placeholder="Paytm Merchant ID" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paytm-merchant-key">Merchant Key</Label>
                                    <Input id="paytm-merchant-key" type="password" placeholder="••••••••••••" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="phonepe" className="mt-6">
                             <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="phonepe-enabled" className="text-base">Enable PhonePe</Label>
                                    <Switch id="phonepe-enabled" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phonepe-merchant-id">Merchant ID</Label>
                                    <Input id="phonepe-merchant-id" placeholder="PhonePe Merchant ID" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phonepe-salt-key">Salt Key</Label>
                                    <Input id="phonepe-salt-key" type="password" placeholder="••••••••••••" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="manual" className="mt-6">
                             <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="manual-enabled" className="text-base">Enable Manual Payments</Label>
                                    <Switch id="manual-enabled" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="upi-id">UPI ID</Label>
                                    <Input id="upi-id" placeholder="yourbusiness@okhdfcbank" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qr-code">Payment QR Code</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                            <p className="text-xs text-center">No QR Code Uploaded</p>
                                        </div>
                                        <Button variant="outline" type="button">
                                            <Upload className="mr-2"/>
                                            Upload QR Code
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Upload a PNG or JPG of your payment QR code.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-6">
                         <Button onClick={handleSave}>Save Payment Settings</Button>
                    </div>
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
