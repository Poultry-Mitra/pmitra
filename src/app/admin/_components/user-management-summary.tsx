
"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { mockUsers } from "@/lib/data";
import Link from "next/link";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type UserStatus = "active" | "suspended" | "pending";
type UserWithStatus = User & { status: UserStatus };

const statusVariant: { [key in UserStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    active: "default",
    suspended: "secondary",
    pending: "outline",
};

const statusColorScheme = {
    active: "text-green-500 border-green-500/50 bg-green-500/10",
    suspended: "text-orange-500 border-orange-500/50 bg-orange-500/10",
    pending: "text-blue-500 border-blue-500/50 bg-blue-500/10",
};


export function UserManagementSummary({ roleToShow }: { roleToShow?: 'farmer' | 'dealer' }) {
    const allUsers = mockUsers.filter(user => user.role !== 'admin');
    const [usersWithStatus, setUsersWithStatus] = useState<UserWithStatus[]>(() => allUsers.map(user => ({...user, status: 'active'})));
    
    useEffect(() => {
        // This logic runs only on the client-side, preventing hydration mismatch.
        const usersWithRandomStatus = allUsers.map(user => ({...user, status: (['active', 'suspended', 'pending'] as UserStatus[])[Math.floor(Math.random() * 3)] }));
        setUsersWithStatus(usersWithRandomStatus);
    }, []);
    
    const [dialogState, setDialogState] = useState<{ action: 'delete' | 'suspend' | null, user: UserWithStatus | null }>({ action: null, user: null });
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [detailsUser, setDetailsUser] = useState<UserWithStatus | null>(null);
    const { toast } = useToast();

    const filteredUsers = usersWithStatus.filter(user => 
        roleToShow ? user.role === roleToShow : true
    );

    const title = roleToShow ? `${roleToShow.charAt(0).toUpperCase() + roleToShow.slice(1)}s` : "Recent Users";
    const description = roleToShow ? `A list of all ${roleToShow}s in the system.` : "Recently active farmers and dealers.";


    const handleSuspend = () => {
        if (!dialogState.user) return;
        
        const finalReason = reason === 'other' ? otherReason : reason;
        if ((dialogState.user.status === 'active' && !finalReason) || (dialogState.action === 'delete' && !finalReason)) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason for this action.",
                variant: "destructive",
            });
            return;
        }

        setUsersWithStatus(usersWithStatus.map(u => u.id === dialogState.user!.id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
        
        toast({
            title: `User ${dialogState.user.status === 'active' ? 'Suspended' : 'Unsuspended'}`,
            description: `${dialogState.user.name} has been successfully ${dialogState.user.status === 'active' ? 'suspended' : 'unsuspended'}. ${finalReason ? `Reason: ${finalReason}` : ''}`,
        });
        setDialogState({ action: null, user: null });
        setReason("");
        setOtherReason("");
    };

    const handleDelete = () => {
        if (!dialogState.user) return;

        const finalReason = reason === 'other' ? otherReason : reason;
         if (!finalReason) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason for deleting the user.",
                variant: "destructive",
            });
            return;
        }

        setUsersWithStatus(usersWithStatus.filter(u => u.id !== dialogState.user!.id));

        toast({
            title: "User Deleted",
            description: `${dialogState.user.name} has been permanently deleted. Reason: ${finalReason}`,
            variant: "destructive",
        });
        setDialogState({ action: null, user: null });
        setReason("");
        setOtherReason("");
    };

    const openDialog = (user: UserWithStatus, action: 'delete' | 'suspend') => {
        setDialogState({ user, action });
    };

    const openDetailsDialog = (user: UserWithStatus) => {
        setDetailsUser(user);
    };
    
    const isUnsuspendAction = dialogState.action === 'suspend' && dialogState.user?.status === 'suspended';

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/user-management/add-user">
                            <PlusCircle className="mr-2" />
                            Add User
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Date Joined</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[user.status]} className={cn("capitalize", statusColorScheme[user.status])}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {new Date(user.dateJoined).toLocaleDateString('en-CA')}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openDetailsDialog(user)}>View Details</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDialog(user, 'suspend')}>
                                                    {user.status === 'active' ? 'Suspend' : 'Unsuspend'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => openDialog(user, 'delete')}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!detailsUser} onOpenChange={(open) => !open && setDetailsUser(null)}>
                 <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Comprehensive details for {detailsUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    {detailsUser && (
                        <div className="py-4">
                            <Tabs defaultValue="overview">
                                <TabsList>
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                                    <TabsTrigger value="orders">Orders</TabsTrigger>
                                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="mt-4">
                                     <Card>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarFallback className="text-2xl">{detailsUser.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-xl font-bold">{detailsUser.name}</h3>
                                                    <div className="text-muted-foreground">{detailsUser.email}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className="capitalize">{detailsUser.role}</Badge>
                                                        <Badge variant={statusVariant[detailsUser.status]} className={cn("capitalize", statusColorScheme[detailsUser.status])}>
                                                            {detailsUser.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><strong className="font-medium">Date Joined:</strong> {new Date(detailsUser.dateJoined).toLocaleDateString()}</div>
                                                <div><strong className="font-medium">User ID:</strong> <span className="font-mono text-xs">{detailsUser.id}</span></div>
                                             </div>
                                        </CardContent>
                                     </Card>
                                </TabsContent>
                                <TabsContent value="subscription" className="mt-4 space-y-2">
                                    <div className="font-medium">Subscription Plan: <Badge>Premium Farmer</Badge></div>
                                    <div className="flex items-center gap-2 font-medium">Status: <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge></div>
                                    <div className="font-medium">Next Billing Date: 2023-12-01</div>
                                </TabsContent>
                                <TabsContent value="orders" className="mt-4">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>ORD-101</TableCell>
                                                <TableCell>2023-10-15</TableCell>
                                                <TableCell>₹1,250</TableCell>
                                                <TableCell><Badge>Completed</Badge></TableCell>
                                            </TableRow>
                                        </TableBody>
                                     </Table>
                                </TabsContent>
                                <TabsContent value="activity" className="mt-4">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>Logged in - 2 hours ago</li>
                                        <li>Viewed Dashboard - 1 hour ago</li>
                                        <li>Started an AI Chat - 30 minutes ago</li>
                                    </ul>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                 </DialogContent>
            </Dialog>

            <AlertDialog open={!!dialogState.action} onOpenChange={() => setDialogState({ action: null, user: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogState.action === 'delete'
                                ? `This action cannot be undone. This will permanently delete ${dialogState.user?.name}'s account and remove their data from our servers.`
                                : `This will ${dialogState.user?.status === 'active' ? 'suspend' : 'unsuspend'} ${dialogState.user?.name}'s account, ${dialogState.user?.status === 'active' ? 'preventing them from logging in' : 'allowing them to log in again'}.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {!isUnsuspendAction && (
                        <div className="space-y-4 my-4">
                             <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Select onValueChange={setReason} value={reason}>
                                    <SelectTrigger id="reason">
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dialogState.action === 'delete' && <SelectItem value="user_request">User Request</SelectItem>}
                                        <SelectItem value="payment_failed">Payment Failed</SelectItem>
                                        <SelectItem value="policy_violation">Policy Violation</SelectItem>
                                        <SelectItem value="spam_activity">Spam Activity</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {reason === 'other' && (
                                <div className="space-y-2">
                                    <Label htmlFor="other-reason">Please specify</Label>
                                    <Textarea id="other-reason" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder="Provide a specific reason..." />
                                </div>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setReason(""); setOtherReason(""); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={dialogState.action === 'delete' ? handleDelete : handleSuspend}
                            className={dialogState.action === 'delete' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}
                        >
                            {dialogState.action === 'delete' ? 'Yes, delete' : `Yes, ${dialogState.user?.status === 'active' ? 'suspend' : 'unsuspend'}`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

    
    