
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function PaymentSettingsPage() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Payment Settings Saved",
            description: "Your payment gateway configurations have been updated.",
        });
    };

    return (
        <>
            <PageHeader title="Payment Gateway Settings" description="Configure payment providers like Razorpay, Paytm, or manual UPI." />
            <div className="mt-8 max-w-4xl">
                 <Card>
                    <CardHeader>
                        <CardTitle>Payment Providers</CardTitle>
                        <CardDescription>Select and configure the payment methods you want to offer for subscriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="razorpay" className="w-full">
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
        </>
    );
}
