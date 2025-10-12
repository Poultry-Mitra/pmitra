
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useUser, useFirestore } from "@/firebase/provider";
import { useUsersByIds } from "@/hooks/use-users";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { doc, onSnapshot } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";

export default function DealersPage() {
  const firebaseUser = useUser();
  const firestore = useFirestore();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!firestore || !firebaseUser?.uid) return;
    const unsub = onSnapshot(doc(firestore, 'users', firebaseUser.uid), (doc) => {
        if (doc.exists()) {
            setUser(doc.data() as AppUser);
        }
    });
    return () => unsub();
  }, [firestore, firebaseUser?.uid]);

  const connectedDealerIds = user?.connectedDealers || [];
  const { users: dealers, loading } = useUsersByIds(connectedDealerIds);
  
  if (!user) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <>
      <PageHeader 
        title="My Dealers"
        description="Manage your connections with dealers."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Connect to New Dealer
        </Button>
      </PageHeader>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <div className="col-span-full text-center"><Loader2 className="animate-spin" /></div>}

        {!loading && dealers.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground p-8">
                You are not connected to any dealers yet. Find a dealer and use their code to connect via your dashboard.
            </div>
        )}
        {!loading && dealers.map(dealer => (
            <Card key={dealer.id}>
                <CardHeader>
                    <CardTitle>{dealer.name}</CardTitle>
                    <CardDescription>{dealer.email}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="w-fit">{dealer.planType === 'premium' ? 'Premium Dealer' : 'Standard Dealer'}</Badge>
                         <Button variant="outline" size="sm" asChild>
                            <Link href={`/dealers/${dealer.id}/products`}>View Products & Order</Link>
                         </Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </>
  );
}
