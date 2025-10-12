
"use client";

import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { currentDealer } from "@/lib/data";

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
    const pageTitle = "My Profile & Settings";
    const pageDescription = "Manage your account and preferences.";

    return (
        <>
            <PageHeader title={pageTitle} description={pageDescription} />
            <div className="mt-8">
                <DealerSettings />
            </div>
        </>
    );
}
