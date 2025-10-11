import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { PageHeader } from "../_components/page-header";

const plans = [
    {
        name: "Free",
        price: "$0",
        price_desc: "per month",
        description: "For small farms and hobbyists starting out.",
        features: [
            "Basic Analytics Dashboard",
            "Limited AI Chat Queries (10/day)",
            "Manual Data Entry",
            "Community Support"
        ],
        cta: "Continue with Free",
        isPopular: false
    },
    {
        name: "Pro",
        price: "$49",
        price_desc: "per month",
        description: "For growing farms that need advanced tools.",
        features: [
            "Advanced Analytics & Reports",
            "Unlimited AI Chat Queries",
            "AI Feed & Problem Forecasts",
            "Real-time Sensor Monitoring",
            "Email & Chat Support"
        ],
        cta: "Upgrade to Pro",
        isPopular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        price_desc: "for large operations",
        description: "Tailored solutions for large-scale poultry businesses.",
        features: [
            "All Pro features",
            "Multi-farm Management",
            "API Access & Integrations",
            "Dedicated Account Manager",
            "On-site Training"
        ],
        cta: "Contact Sales",
        isPopular: false
    }
]

export default function PricingPage() {
    return (
        <>
            <PageHeader
                title="Subscription Plans"
                description="Choose the plan that's right for your farm. Unlock powerful AI features to boost your productivity."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map(plan => (
                    <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
                         <CardHeader className="relative">
                            {plan.isPopular && <div className="absolute top-0 right-4 -mt-3 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Most Popular</div>}
                            <CardTitle className="font-headline">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div>
                                <span className="text-3xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.price_desc}</span>
                            </div>
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
                ))}
            </div>
        </>
    )
}
