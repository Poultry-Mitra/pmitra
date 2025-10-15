// src/app/admin/dashboard/_components/recent-users.tsx
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types"; 
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';


export function RecentUsers({ users, loading }: { users: User[], loading: boolean }) {
  const recentUsers = useMemo(() => {
    return [...users]
        .sort((a, b) => new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime())
        .slice(0, 5);
  }, [users]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>
          The last 5 users who joined the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {loading ? (
             [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <Skeleton className="h-9 w-9 rounded-full" />
                         <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                         </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-md" />
                </div>
            ))
        ) : recentUsers.length > 0 ? recentUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Badge variant={user.role === 'farmer' ? 'secondary' : 'outline'} className="capitalize">{user.role}</Badge>
          </div>
        )) : (
            <p className="text-sm text-muted-foreground text-center">No users found.</p>
        )}
        <Button asChild variant="outline" className="w-full">
            <Link href="/admin/user-management/farmers">View All Users</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
