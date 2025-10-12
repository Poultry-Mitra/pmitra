

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap } from "lucide-react";
import { PageHeader } from "../_components/page-header";
import type { PricingPlan } from "@/lib/types";
import { useState } from "react";

const initialPlans: Omit<PricingPlan, 'priceMonthly' | 'priceYearly'>[] = [
    {
        name: "Free",
        price: "₹0",
        priceDesc: "for basic needs",
        description: "For small farms and hobbyists starting out.",
        features: [
            "1 Batch Limit",
            "Limited AI Chat Queries (5/month)",
            "Manual Data Entry",
            "Community Access",
            "Single Device Access",
        ],
        cta: "Continue with Free",
        isPopular: false,
        userType: "Farmer",
    },
    {
        name: "Premium",
        price: "₹249",
        priceDesc: "per month",
        description: "For growing farms that need advanced tools.",
        features: [
            "Unlimited Batches",
            "Unlimited AI Chat Queries",
            "Advanced Analytics & Reports",
            "Feed AI Suggestions",
            "Daily Market Rates Access",
            "Data Export (PDF, Excel)",
            "Ad-free Experience"
        ],
        cta: "Upgrade to Premium",
        isPopular: true,
        userType: "Farmer",
    },
     {
        name: "Free",
        price: "₹0",
        priceDesc: "for basic needs",
        description: "For dealers starting out.",
        features: [
            "Manage up to 2 farmers",
            "Limited AI Chat Queries (5/month)",
            "Basic Sales Report",
            "Single Device Access",
        ],
        cta: "Continue with Free",
        isPopular: false,
        userType: "Dealer",
    },
    {
        name: "Premium",
        price: "₹499",
        priceDesc: "per month",
        description: "Tailored solutions for large-scale poultry businesses and dealers.",
        features: [
            "Unlimited Farmer Connections",
            "Unlimited AI Chat Queries",
            "Full Dealer Dashboard",
            "Advanced Analytics",
            "Daily Market Rate Access",
            "CRM System",
            "Ad-free Experience",
        ],
        cta: "Choose Premium",
        isPopular: true,
        userType: "Dealer",
    }
]

function PricingCard({ plan }: { plan: PricingPlan }) {
    return (
        <Card className={`flex flex-col ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
             <CardHeader className="relative">
                {plan.isPopular && (
                    <div className="absolute top-0 right-4 -mt-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                        <Zap className="size-3" /> Most Popular
                    </div>
                )}
                <CardTitle className="font-headline">{plan.name} <span className="text-sm font-normal text-muted-foreground">({plan.userType})</span></CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">₹{plan.priceMonthly}</span>
                    <span className="text-muted-foreground">/month</span>
                </div>
                 {plan.priceYearly !== "—" && (
                    <div className="text-sm text-muted-foreground">
                        or ₹{plan.priceYearly} per year
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {plan.features.map(feature => (
                        <li key={feature} className="flex items-start">
                            <CheckCircle className="mr-2 mt-1 size-4 shrink-0 text-green-500" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>{plan.cta}</Button>
            </CardFooter>
        </Card>
    )
}

export default function PricingPage() {
    // In a real app, these prices would be fetched from a database.
    // The admin settings page would update the database.
    const [prices, setPrices] = useState({
        farmer: { monthly: 249, yearly: 2499 },
        dealer: { monthly: 499, yearly: 4999 },
    });
    
    const plans: PricingPlan[] = initialPlans.map(p => {
        if(p.userType === "Farmer" && p.name === "Premium") {
            return { ...p, priceMonthly: prices.farmer.monthly.toString(), priceYearly: prices.farmer.yearly.toString() };
        }
        if(p.userType === "Dealer" && p.name === "Premium") {
            return { ...p, priceMonthly: prices.dealer.monthly.toString(), priceYearly: prices.dealer.yearly.toString() };
        }
        return { ...p, priceMonthly: "0", priceYearly: "—" };
    });

    const farmerPlans = plans.filter(p => p.userType === 'Farmer');
    const dealerPlans = plans.filter(p => p.userType === 'Dealer');

    return (
        <>
            <PageHeader
                title="Subscription Plans"
                description="Choose the plan that's right for your farm. Unlock powerful AI features to boost your productivity."
            />

            <div className="mt-8 space-y-12">
                <div>
                    <h2 className="font-headline text-2xl font-bold tracking-tight mb-6">For Farmers (मुर्गीपालक)</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {farmerPlans.map(plan => (
                            <PricingCard key={`${plan.name}-${plan.userType}`} plan={plan} />
                        ))}
                    </div>
                </div>

                 <div>
                    <h2 className="font-headline text-2xl font-bold tracking-tight mb-6">For Dealers (डीलर / सप्लायर)</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {dealerPlans.map(plan => (
                             <PricingCard key={`${plan.name}-${plan.userType}`} plan={plan} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
