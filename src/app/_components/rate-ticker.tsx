
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Bird, IndianRupee, Loader2 } from 'lucide-react';
import type { DailyRates } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export function RateTicker() {
    const firestore = useFirestore();
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

    if (loading) {
        return (
             <div className="bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 h-10 flex items-center justify-center text-sm">
                    <Loader2 className="animate-spin mr-2 size-4" />
                    Loading live rates...
                </div>
            </div>
        );
    }
    
    if (rates.length === 0) {
        return (
             <div className="bg-secondary text-secondary-foreground">
                <div className="container mx-auto px-4 h-10 flex items-center justify-center text-sm">
                    Live rates not available right now.
                </div>
            </div>
        );
    }

    const currentItem = rates[currentIndex];
    
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
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                }
            `}</style>
        </Link>
    );
}
