
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, Bird, IndianRupee, Loader2, EyeOff } from 'lucide-react';
import type { DailyRates } from '@/lib/types';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppUser } from '@/app/app-provider';
import { mockDailyRates } from '@/lib/data';

export function RateTicker() {
    const firestore = useFirestore();
    const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
    const { user: appUser, loading: isAppUserLoading } = useAppUser();
    const [allRates, setAllRates] = useState<DailyRates[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const isLoggedIn = !!firebaseUser;

    useEffect(() => {
        // Only fetch from Firestore if the user is logged in
        if (!firestore || !isLoggedIn) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const q = query(collection(firestore, 'dailyRates'), orderBy('lastUpdated', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const fetchedRates = snapshot.docs.map(doc => doc.data() as DailyRates);
                setAllRates(fetchedRates);
            } else {
                setAllRates([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching live rates:", error);
            setLoading(false);
            setAllRates([]);
        });
        return () => unsubscribe();
    }, [firestore, isLoggedIn]);

    const filteredRates = useMemo(() => {
        if (!isLoggedIn || allRates.length === 0) return [];
        if (!appUser || !appUser.state || !appUser.district) return allRates;

        if (appUser.planType === 'premium') {
            const userDistrictRate = allRates.find(rate => rate.location.district === appUser.district);
            const userStateRates = allRates.filter(rate => rate.location.state === appUser.state && rate.location.district !== appUser.district);
            const otherRates = allRates.filter(rate => rate.location.state !== appUser.state);
            return [userDistrictRate, ...userStateRates, ...otherRates].filter(Boolean) as DailyRates[];
        } else {
            const otherState = allRates.find(r => r.location.state !== appUser.state)?.location.state;
            if (otherState) {
                return allRates.filter(rate => rate.location.state === otherState);
            }
            return allRates;
        }
    }, [allRates, appUser, isLoggedIn]);

    const ratesToDisplay = isLoggedIn ? (filteredRates.length > 0 ? filteredRates : allRates) : mockDailyRates;

    useEffect(() => {
        if (ratesToDisplay.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % ratesToDisplay.length);
            }, 5000); // Change location every 5 seconds
            return () => clearInterval(interval);
        }
    }, [ratesToDisplay]);

    const isLoading = isAuthLoading || (isLoggedIn && loading);
    const currentItem = ratesToDisplay.length > 0 ? ratesToDisplay[currentIndex] : { location: { district: 'N/A', state: '' }, readyBird: { medium: '??' }, chickRate: '??' };

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
    
    if (ratesToDisplay.length === 0 && isLoggedIn) {
        return (
             <div className="bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 h-10 flex items-center justify-center text-sm">
                    Live rates not available right now.
                </div>
            </div>
        );
    }

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
