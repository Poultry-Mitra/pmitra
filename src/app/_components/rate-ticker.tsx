
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Bird, IndianRupee, Loader2, EyeOff } from 'lucide-react';
import type { DailyRates } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase/provider';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RateTicker() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [rates, setRates] = useState<DailyRates[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const q = query(collection(firestore, 'dailyRates'), orderBy('lastUpdated', 'desc'), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const fetchedRates = snapshot.docs.map(doc => doc.data() as DailyRates);
                setRates(fetchedRates);
            } else {
                setRates([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching live rates:", error);
            setLoading(false);
            setRates([]);
        });
        return () => unsubscribe();
    }, [firestore]);

    useEffect(() => {
        if (rates.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % rates.length);
            }, 5000); // Change location every 5 seconds
            return () => clearInterval(interval);
        }
    }, [rates.length]);

    const isLoading = loading || isUserLoading;

    if (isLoading) {
        return (
             <div className="bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 h-10 flex items-center justify-center text-sm">
                    <Loader2 className="animate-spin mr-2 size-4" />
                    Loading live rates...
                </div>
            </div>
        );
    }
    
    if (rates.length === 0 && user) {
        return (
             <div className="bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 h-10 flex items-center justify-center text-sm">
                    Live rates not available right now.
                </div>
            </div>
        );
    }

    const currentItem = rates.length > 0 ? rates[currentIndex] : { location: { district: 'N/A', state: '' }, readyBird: { medium: '??' }, chickRate: '??' };
    const isLoggedIn = !!user;

    return (
        <div className="bg-secondary text-secondary-foreground transition-colors relative">
            <div className={cn(
                "container mx-auto px-4 h-10 flex items-center overflow-hidden",
                !isLoggedIn && "blur-sm pointer-events-none select-none"
            )}>
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
                     <Link href="/pricing" className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold ml-4">
                        Click to Unlock Full Access
                    </Link>
                </div>
            </div>
            {!isLoggedIn && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm z-10">
                    <Button asChild>
                        <Link href="/login">
                            <EyeOff className="mr-2" />
                            Login to View Live Rates
                        </Link>
                    </Button>
                </div>
            )}
             <style jsx>{`
                @keyframes ticker {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-ticker {
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
}
