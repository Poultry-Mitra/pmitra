
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/app/dealer/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from '@/firebase/provider';
import type { User as AppUser } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

function DealerSettings() {
    const { toast } = useToast();
    const { user: firebaseUser } = useUser();
    const firestore = useFirestore();
    const [dealer, setDealer] = useState<AppUser | null>(null);

    useEffect(() => {
        if (firebaseUser && firestore) {
            const unsub = onSnapshot(doc(firestore, 'users', firebaseUser.uid), (doc) => {
                if (doc.exists()) {
                    setDealer(doc.data() as AppUser);
                }
            });
            return () => unsub();
        }
    }, [firebaseUser, firestore]);

    const handleProfileSave = () => {
        // In a real app, this would use updateDoc to save the new name/email.
        toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    };

    if (!dealer) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>;
    
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
