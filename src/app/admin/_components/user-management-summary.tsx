

"use client";

import { useState } from "react";
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

type UserStatus = "active" | "suspended" | "pending";

const statusVariant: { [key in UserStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    active: "outline",
    suspended: "secondary",
    pending: "default",
};

const statusColorScheme = {
    active: "text-green-500 border-green-500/50",
    suspended: "text-orange-500 border-orange-500/50",
    pending: "text-blue-500 border-blue-500/50",
};


export function UserManagementSummary({ roleToShow }: { roleToShow?: 'farmer' | 'dealer' }) {
    const allUsers = mockUsers.filter(user => user.role !== 'admin').map(user => ({...user, status: 'active' as UserStatus}));
    const [users, setUsers] = useState(allUsers);
    
    const [dialogState, setDialogState] = useState<{ action: 'delete' | 'suspend' | null, user: User | null }>({ action: null, user: null });
    const [detailsUser, setDetailsUser] = useState<User | null>(null);
    const { toast } = useToast();

    const filteredUsers = users.filter(user => 
        roleToShow ? user.role === roleToShow : true
    );

    const title = roleToShow ? `${roleToShow.charAt(0).toUpperCase() + roleToShow.slice(1)}s` : "Recent Users";
    const description = roleToShow ? `A list of all ${roleToShow}s in the system.` : "Recently active farmers and dealers.";


    const handleSuspend = () => {
        if (!dialogState.user) return;
        
        // This is where you would call a Firebase Function to disable the user
        // For now, we'll just update the local state
        setUsers(users.map(u => u.id === dialogState.user!.id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
        
        toast({
            title: `User ${dialogState.user.status === 'active' ? 'Suspended' : 'Unsuspended'}`,
            description: `${dialogState.user.name} has been successfully ${dialogState.user.status === 'active' ? 'suspended' : 'unsuspended'}.`,
        });
        setDialogState({ action: null, user: null });
    };

    const handleDelete = () => {
        if (!dialogState.user) return;

        // This is where you would call a Firebase Function to delete the user from Auth and Firestore
        // For now, we'll just filter the user from local state
        setUsers(users.filter(u => u.id !== dialogState.user!.id));

        toast({
            title: "User Deleted",
            description: `${dialogState.user.name} has been permanently deleted.`,
            variant: "destructive",
        });
        setDialogState({ action: null, user: null });
    };

    const openDialog = (user: User, action: 'delete' | 'suspend') => {
        setDialogState({ user, action });
    };

    const openDetailsDialog = (user: User) => {
        setDetailsUser(user);
    };
    
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
                            {filteredUsers.map((user: User & { status: UserStatus }) => (
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
                                                    <p className="text-muted-foreground">{detailsUser.email}</p>
                                                    <Badge className="capitalize mt-1">{detailsUser.role}</Badge>
                                                </div>
                                            </div>
                                             <div className="grid grid-cols-2 gap-2 text-sm">
                                                <p><strong className="font-medium">Date Joined:</strong> {new Date(detailsUser.dateJoined).toLocaleDateString()}</p>
                                                <p><strong className="font-medium">User ID:</strong> <span className="font-mono text-xs">{detailsUser.id}</span></p>
                                             </div>
                                        </CardContent>
                                     </Card>
                                </TabsContent>
                                <TabsContent value="subscription" className="mt-4 space-y-2">
                                    <div>Subscription Plan: <Badge>Premium Farmer</Badge></div>
                                    <div>Status: <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge></div>
                                    <div>Next Billing Date: 2023-12-01</div>
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
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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

    