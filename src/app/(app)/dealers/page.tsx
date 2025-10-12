

"use client";

import { useState } from "react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useUser } from "@/firebase/provider";
import { useUsersByIds } from "@/hooks/use-users";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DealersPage() {
  const user = useUser();
  const connectedDealerIds = user?.connectedDealers || [];
  const { users: dealers, loading } = useUsersByIds(connectedDealerIds);
  
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
        {loading && <Loader2 className="animate-spin" />}

        {!loading && dealers.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
                You are not connected to any dealers yet. Use a dealer's code to connect.
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
                        <Badge variant="secondary" className="w-fit">Premium Dealer</Badge>
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
