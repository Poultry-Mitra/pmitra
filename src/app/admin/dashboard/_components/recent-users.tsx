
// src/app/admin/dashboard/_components/recent-users.tsx
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

export function RecentUsers({ users, loading }: { users: User[], loading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>The last 5 users who joined.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> : (
                    <div className="space-y-4">
                        {users.slice(0, 5).map(user => (
                            <div key={user.id} className="flex items-center gap-4">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="ml-auto font-medium">
                                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                </div>
                            </div>
                        ))}
                         {users.length === 0 && (
                            <div className="text-center text-muted-foreground p-4">No users found.</div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
