// src/components/ui/page-header.tsx
"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const pageHeaderVariants = cva("flex flex-col", {
    variants: {
        variant: {
            default: "md:flex-row md:items-center md:justify-between",
            centered: "mx-auto max-w-[58rem] items-center space-y-4 text-center",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const pageHeaderTitleVariants = cva("font-headline font-bold tracking-tight", {
    variants: {
        variant: {
            default: "text-2xl md:text-3xl",
            centered: "text-3xl leading-[1.1] sm:text-3xl md:text-5xl",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const pageHeaderDescriptionVariants = cva("text-muted-foreground", {
     variants: {
        variant: {
            default: "",
            centered: "max-w-[85%] leading-normal sm:text-lg sm:leading-7",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});


export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pageHeaderVariants> {
    title: string;
    description?: string;
    children?: React.ReactNode;
}


export function PageHeader({ title, description, children, className, variant, ...props }: PageHeaderProps) {
    return (
        <div className={cn(pageHeaderVariants({ variant }), className)} {...props}>
            <div className="space-y-1">
                <h1 className={cn(pageHeaderTitleVariants({ variant }))}>
                    {title}
                </h1>
                {description && <p className={cn(pageHeaderDescriptionVariants({ variant }))}>{description}</p>}
            </div>
            {children && <div className={cn("flex shrink-0 items-center gap-2", variant === 'centered' && 'justify-center')}>{children}</div>}
        </div>
    );
}