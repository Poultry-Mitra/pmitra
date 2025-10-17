// src/app/(public)/_components/page-header.tsx
"use client";

type PageHeaderProps = {
    title: string;
    description?: string;
    children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h1 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                {title}
            </h1>
            {description && (
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    {description}
                </p>
            )}
            {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
        </div>
    );
}
