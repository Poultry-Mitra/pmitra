
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
import { Upload, AlertTriangle, Save } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";


function GeneralSettings() {
    return (
        <CardContent className="space-y-6">
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
        </CardContent>
    );
}

function AlertThresholdSettings() {
     return (
        <CardContent className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mortality Rate Alerts (%)</CardTitle>
                    <CardDescription>Set percentage thresholds for daily mortality to trigger alerts for farmers.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="mortality-warning">Warning Threshold</Label>
                        <Input id="mortality-warning" type="number" defaultValue="5" />
                         <p className="text-xs text-muted-foreground">Alert when daily mortality exceeds this percentage.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mortality-critical">Critical Threshold</Label>
                        <Input id="mortality-critical" type="number" defaultValue="10" />
                        <p className="text-xs text-muted-foreground">Alert when daily mortality exceeds this critical percentage.</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Feed Conversion Ratio (FCR) Alerts</CardTitle>
                    <CardDescription>Trigger alerts if FCR goes above these thresholds, indicating inefficiency.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fcr-warning">Warning Threshold</Label>
                        <Input id="fcr-warning" type="number" defaultValue="1.8" />
                         <p className="text-xs text-muted-foreground">An FCR above this value is suboptimal.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fcr-critical">Critical Threshold</Label>
                        <Input id="fcr-critical" type="number" defaultValue="2.2" />
                        <p className="text-xs text-muted-foreground">An FCR above this value requires immediate attention.</p>
                    </div>
                </CardContent>
            </Card>
        </CardContent>
    );
}


function FeatureSettings({ onSettingsChange }: { onSettingsChange: (key: string, value: any, description: string) => void }) {
    const [aiChatEnabled, setAiChatEnabled] = useState(true);
    const [paymentsEnabled, setPaymentsEnabled] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsEnabled, setRegistrationsEnabled] = useState(true);

    const handleToggle = (setter: Function, value: boolean, key: string, description: string) => {
        setter(!value);
        onSettingsChange(key, !value, description);
    };

    return (
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode" className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Put the app in maintenance mode for all non-admin users.
                    </p>
                </div>
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={(checked) => handleToggle(setMaintenanceMode, maintenanceMode, 'maintenance', checked ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled')} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="registrations" className="text-base">New User Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                        Enable or disable new user sign-ups.
                    </p>
                </div>
                <Switch id="registrations" checked={registrationsEnabled} onCheckedChange={(checked) => handleToggle(setRegistrationsEnabled, registrationsEnabled, 'registrations', checked ? 'Registrations Enabled' : 'Registrations Disabled')} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="ai-chat" className="text-base">AI Chat</Label>
                    <p className="text-sm text-muted-foreground">
                        Enable or disable the AI chat support feature for users.
                    </p>
                </div>
                <Switch id="ai-chat" checked={aiChatEnabled} onCheckedChange={(checked) => handleToggle(setAiChatEnabled, aiChatEnabled, 'ai_chat', checked ? 'AI Chat Enabled' : 'AI Chat Disabled')} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="payments" className="text-base">Payments</Label>
                    <p className="text-sm text-muted-foreground">
                        Enable or disable subscription payments.
                    </p>
                </div>
                <Switch id="payments" checked={paymentsEnabled} onCheckedChange={(checked) => handleToggle(setPaymentsEnabled, paymentsEnabled, 'payments', checked ? 'Payments Enabled' : 'Payments Disabled')} />
            </div>
             <div className="space-y-2 rounded-lg border p-4">
                <Label htmlFor="ai-chat-limit" className="text-base">Monthly AI Chat Limit (Free Plan)</Label>
                <p className="text-sm text-muted-foreground pb-2">
                    Set the number of free AI chat queries per month for users on the free plan.
                </p>
                <Input id="ai-chat-limit" type="number" defaultValue="5" className="w-[120px]" />
            </div>
        </CardContent>
    );
}

function AppearanceSettings() {
    return (
        <CardContent className="space-y-6">
            <div className="space-y-2 rounded-lg border p-4">
                <Label htmlFor="logo-upload" className="text-base">Application Logo</Label>
                <p className="text-sm text-muted-foreground pb-2">
                    Upload a new logo. It will be displayed in the sidebar and on login pages.
                </p>
                 <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                        <p className="text-xs text-center">Current Logo</p>
                    </div>
                    <Button variant="outline" type="button">
                        <Upload className="mr-2"/>
                        Upload New Logo
                    </Button>
                </div>
            </div>
        </CardContent>
    );
}


export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [showSaveAlert, setShowSaveAlert] = useState(false);
    const [lastChange, setLastChange] = useState({ key: '', value: false, description: '' });

    const handleSettingsChange = (key: string, value: any, description: string) => {
        setLastChange({ key, value, description });
    };

    const handleSave = () => {
        // In a real app, this would write to Firestore.
        console.log("Saving all settings...");
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
        setShowSaveAlert(true);
    };

    const handleNotificationRedirect = () => {
        setShowSaveAlert(false);
        const title = encodeURIComponent(lastChange.description);
        const message = encodeURIComponent(`The ${lastChange.key.replace(/_/g, ' ')} feature has been ${lastChange.value ? 'enabled' : 'temporarily disabled'}. We are working to improve it.`);
        router.push(`/admin/notifications?title=${title}&message=${message}`);
    };
    
    return (
        <>
            <PageHeader title="App Settings" description="Configure global application settings and features." />
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>App Configuration</CardTitle>
                        <CardDescription>Manage core features, alert thresholds, appearance, and default behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="features" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="features">Features</TabsTrigger>
                                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                            </TabsList>
                            <TabsContent value="general" className="mt-6">
                                <GeneralSettings />
                            </TabsContent>
                             <TabsContent value="features" className="mt-6">
                                <FeatureSettings onSettingsChange={handleSettingsChange} />
                            </TabsContent>
                             <TabsContent value="alerts" className="mt-6">
                                <AlertThresholdSettings />
                            </TabsContent>
                            <TabsContent value="appearance" className="mt-6">
                                <AppearanceSettings />
                            </TabsContent>
                        </Tabs>
                        <div className="mt-6 flex justify-end">
                             <Button onClick={handleSave}>
                                <Save className="mr-2" />
                                Save All Settings
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <AlertDialog open={showSaveAlert} onOpenChange={setShowSaveAlert}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-primary"/>
                        Notify Users About This Change?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You have changed the '{lastChange.description}' setting. Would you like to send a notification to users to inform them of this update?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowSaveAlert(false)}>Don't Notify</AlertDialogCancel>
                    <AlertDialogAction onClick={handleNotificationRedirect}>
                        Yes, Notify Users
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
