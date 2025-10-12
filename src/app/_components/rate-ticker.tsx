
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockDailyRates } from '@/lib/data';
import { TrendingUp, Bird, IndianRupee } from 'lucide-react';
import type { DailyRates } from '@/lib/types';
import { cn } from '@/lib/utils';

export function RateTicker() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentItem, setCurrentItem] = useState<DailyRates | null>(null);

    useEffect(() => {
        // Set initial item on client mount to avoid hydration mismatch
        setCurrentItem(mockDailyRates[0]);

        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % mockDailyRates.length);
        }, 5000); // Change location every 5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Update the displayed item when currentIndex changes
        setCurrentItem(mockDailyRates[currentIndex]);
    }, [currentIndex]);

    if (!currentItem) {
        return (
             <div className="bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 h-10 flex items-center justify-center text-sm">
                    Loading live rates...
                </div>
            </div>
        );
    }
    
    return (
        <Link href="/pricing" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors cursor-pointer">
            <div className="container mx-auto px-4 h-10 flex items-center overflow-hidden">
                <div className="flex items-center gap-6 animate-ticker">
                    <div className="flex items-center gap-2">
                         <span className="flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider">
                            <TrendingUp className="size-4" />
                            Live Rates
                        </span>
                        <span className="text-sm font-medium">{currentItem.location.district}, {currentItem.location.state}</span>
                    </div>

                    <span className="h-4 w-px bg-border"></span>

                    <div className="flex items-center gap-2 text-sm">
                        <Bird className="size-4 text-muted-foreground" />
                        <span className="font-semibold">Ready Bird:</span>
                        <span className="font-mono text-primary font-bold">₹{currentItem.readyBird.medium}/kg</span>
                    </div>

                    <span className="h-4 w-px bg-border"></span>
                    
                    <div className="flex items-center gap-2 text-sm">
                         <IndianRupee className="size-4 text-muted-foreground" />
                        <span className="font-semibold">Chick Rate:</span>
                        <span className="font-mono text-primary font-bold">₹{currentItem.chickRate}/chick</span>
                    </div>
                     <span className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold ml-4">
                        Click to Unlock Full Access
                    </span>
                </div>
            </div>
             <style jsx>{`
                @keyframes ticker {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-ticker {
                    // animation: ticker 20s linear infinite; // This can be enabled for a continuous scroll effect
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                }
            `}</style>
        </Link>
    );
}

