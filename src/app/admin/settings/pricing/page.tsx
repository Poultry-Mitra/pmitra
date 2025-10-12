
"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee } from "lucide-react";

export default function PricingSettingsPage() {
    const { toast } = useToast();

    const handlePricingSave = () => {
        toast({
            title: "Pricing Updated",
            description: "Subscription plan prices have been saved.",
        });
    }

    return (
        <>
            <PageHeader title="Pricing Plan Management" description="Update the monthly and yearly prices for subscription plans." />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Farmer Plan</CardTitle>
                        <CardDescription>Set the pricing for farmers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="farmer-monthly">Monthly Price (₹)</Label>
                            <Input id="farmer-monthly" type="number" defaultValue="249" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="farmer-yearly">Yearly Price (₹)</Label>
                            <Input id="farmer-yearly" type="number" defaultValue="2499" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Dealer Plan</CardTitle>
                        <CardDescription>Set the pricing for dealers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="dealer-monthly">Monthly Price (₹)</Label>
                            <Input id="dealer-monthly" type="number" defaultValue="499" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dealer-yearly">Yearly Price (₹)</Label>
                            <Input id="dealer-yearly" type="number" defaultValue="4999" />
                        </div>
                    </CardContent>
                </Card>
                 <div className="md:col-span-2">
                    <Button onClick={handlePricingSave} className="w-full">
                        <IndianRupee className="mr-2"/>
                        Save All Pricing
                    </Button>
                </div>
            </div>
        </>
    );
}
