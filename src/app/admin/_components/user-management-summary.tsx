

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
    DropdownMenuSeparator,
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
import { MoreHorizontal, PlusCircle, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { User, UserStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers, deleteUser, updateUserStatus } from "@/hooks/use-users";
import { useFirestore, useUser as useAuthUser } from "@/firebase/provider";
import { addAuditLog } from "@/hooks/use-audit-logs";
import { useLanguage } from "@/components/language-provider";


const statusVariant: { [key in UserStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    Active: "default",
    Suspended: "secondary",
    Pending: "outline",
};

const statusColorScheme = {
    Active: "text-green-500 border-green-500/50 bg-green-500/10",
    Suspended: "text-orange-500 border-orange-500/50 bg-orange-500/10",
    Pending: "text-blue-500 border-blue-500/50 bg-blue-500/10",
};


export function UserManagementSummary({ roleToShow }: { roleToShow?: 'farmer' | 'dealer' }) {
    const { users, loading } = useUsers(roleToShow);
    
    const [dialogState, setDialogState] = useState<{ action: 'delete' | 'suspend' | 'approve' | null, user: User | null }>({ action: null, user: null });
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [detailsUser, setDetailsUser] = useState<User | null>(null);
    const { toast } = useToast();
    const firestore = useFirestore();
    const adminUser = useAuthUser();
    const { t } = useLanguage();

    const filteredUsers = roleToShow ? users : users.slice(0, 5); // Show only 5 recent users on dashboard view

    const title = roleToShow ? t(`admin.users.title_${roleToShow}`) : t('admin.users.title_recent');
    const description = roleToShow ? t(`admin.users.description_${roleToShow}`) : t('admin.users.description_recent');

    const handleStatusUpdate = async (newStatus: UserStatus) => {
        if (!dialogState.user || !firestore || !adminUser.user) return;
        
        const finalReason = reason === 'other' ? otherReason : reason;
        if ((dialogState.action === 'suspend' && !finalReason) || (dialogState.action === 'delete' && !finalReason)) {
            toast({
                title: t('admin.users.reason_required_title'),
                description: t('admin.users.reason_required_desc'),
                variant: "destructive",
            });
            return;
        }

        try {
            await updateUserStatus(firestore, dialogState.user.id, newStatus);
            await addAuditLog(firestore, {
                adminUID: adminUser.user.uid,
                action: 'UPDATE_USER_STATUS',
                timestamp: new Date().toISOString(),
                details: `Changed status of ${dialogState.user.name} to ${newStatus}. ${finalReason ? `Reason: ${finalReason}` : ''}`,
            });

            toast({
                title: `User Status Updated`,
                description: `${dialogState.user.name}'s status has been changed to ${newStatus}.`,
            });
        } catch (error: any) {
             toast({
                title: "Update Failed",
                description: error.message || `Could not update user status.`,
                variant: "destructive",
            });
        }
        
        setDialogState({ action: null, user: null });
        setReason("");
        setOtherReason("");
    };

    const handleDelete = async () => {
        if (!dialogState.user || !firestore || !adminUser.user) return;

        const finalReason = reason === 'other' ? otherReason : reason;
         if (!finalReason) {
            toast({
                title: t('admin.users.reason_required_title_delete'),
                description: t('admin.users.reason_required_desc_delete'),
                variant: "destructive",
            });
            return;
        }

        try {
            await deleteUser(firestore, dialogState.user.id);
            await addAuditLog(firestore, {
                adminUID: adminUser.user.uid,
                action: 'DELETE_USER',
                timestamp: new Date().toISOString(),
                details: `Deleted user: ${dialogState.user.name} (${dialogState.user.id}). Reason: ${finalReason}`,
            });

            toast({
                title: t('admin.users.user_deleted_title'),
                description: t('admin.users.user_deleted_desc', { name: dialogState.user.name }),
                variant: "destructive",
            });
        } catch (error: any) {
            toast({
                title: t('admin.users.delete_failed_title'),
                description: error.message || t('admin.users.delete_failed_desc'),
                variant: "destructive",
            });
        }
        
        setDialogState({ action: null, user: null });
        setReason("");
        setOtherReason("");
    };

    const openDialog = (user: User, action: 'delete' | 'suspend' | 'approve') => {
        setDialogState({ user, action });
    };

    const openDetailsDialog = (user: User) => {
        setDetailsUser(user);
    };
    
    const isUnsuspendAction = dialogState.action === 'suspend' && dialogState.user?.status === 'Suspended';

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {roleToShow && (
                        <Button asChild>
                            <Link href="/admin/user-management/add-user">
                                <PlusCircle className="mr-2" />
                                {t('admin.users.add_user_button')}
                            </Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('tables.user')}</TableHead>
                                <TableHead>{t('tables.role')}</TableHead>
                                <TableHead>{t('tables.status')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('tables.date_joined')}</TableHead>
                                <TableHead><span className="sr-only">{t('tables.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        <div className="flex justify-center items-center p-4">
                                            <Loader2 className="animate-spin mr-2" /> {t('messages.loading_users')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center p-8">
                                        {t('messages.no_users_found')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && filteredUsers.map((user) => (
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
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{t(`roles.${user.role}`)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[user.status]} className={cn("capitalize", statusColorScheme[user.status])}>
                                            {t(`status.${user.status}`)}
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
                                                    <span className="sr-only">{t('actions.toggle_menu')}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openDetailsDialog(user)}>{t('actions.view_details')}</DropdownMenuItem>
                                                {user.role !== 'admin' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        {user.status === 'Pending' && <DropdownMenuItem className="text-green-600 focus:text-green-700" onClick={() => openDialog(user, 'approve')}><CheckCircle className="mr-2" />Approve User</DropdownMenuItem>}
                                                        {user.status === 'Active' && <DropdownMenuItem onClick={() => openDialog(user, 'suspend')}>{t('actions.suspend')}</DropdownMenuItem>}
                                                        {user.status === 'Suspended' && <DropdownMenuItem onClick={() => openDialog(user, 'suspend')}>{t('actions.unsuspend')}</DropdownMenuItem>}
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDialog(user, 'delete')}>{t('actions.delete')}</DropdownMenuItem>
                                                    </>
                                                )}
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
                        <DialogTitle>{t('admin.users.details_title')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.users.details_desc', { name: detailsUser?.name })}
                        </DialogDescription>
                    </DialogHeader>
                    {detailsUser && (
                        <div className="py-4">
                            <Tabs defaultValue="overview">
                                <TabsList>
                                    <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
                                    <TabsTrigger value="subscription">{t('tabs.subscription')}</TabsTrigger>
                                    <TabsTrigger value="activity">{t('tabs.activity')}</TabsTrigger>
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
                                                        <Badge className="capitalize">{t(`roles.${detailsUser.role}`)}</Badge>
                                                        <Badge variant={statusVariant[detailsUser.status]} className={cn("capitalize", statusColorScheme[detailsUser.status])}>
                                                            {t(`status.${detailsUser.status}`)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><strong className="font-medium">{t('labels.date_joined')}:</strong> {new Date(detailsUser.dateJoined).toLocaleDateString()}</div>
                                                <div><strong className="font-medium">{t('labels.user_id')}:</strong> <span className="font-mono text-xs">{detailsUser.id}</span></div>
                                             </div>
                                        </CardContent>
                                     </Card>
                                </TabsContent>
                                <TabsContent value="subscription" className="mt-4 space-y-2 text-sm">
                                    <div><strong className="font-medium">{t('labels.subscription_plan')}:</strong> <Badge variant={detailsUser.planType === 'premium' ? 'default' : 'secondary'} className="capitalize">{detailsUser.planType}</Badge></div>
                                    <div className="flex items-center gap-2 "><strong className="font-medium">{t('labels.status')}:</strong> <Badge variant="outline" className="text-green-500 border-green-500">{t('status.active')}</Badge></div>
                                    <div><strong className="font-medium">{t('labels.next_billing_date')}:</strong> {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</div>
                                </TabsContent>
                                <TabsContent value="activity" className="mt-4">
                                    <div className="text-center text-muted-foreground p-4">
                                        No recent activity to display.
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                 </DialogContent>
            </Dialog>

            <AlertDialog open={!!dialogState.action} onOpenChange={() => setDialogState({ action: null, user: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{
                            dialogState.action === 'approve' ? 'Approve User' : t('dialog.are_you_sure_title')
                        }</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogState.action === 'delete'
                                ? t('dialog.delete_user_desc', { name: dialogState.user?.name })
                                : dialogState.action === 'approve' 
                                ? `Are you sure you want to approve ${dialogState.user?.name}? Their account will become active.`
                                : t(dialogState.user?.status === 'Active' ? 'dialog.suspend_user_desc' : 'dialog.unsuspend_user_desc', { name: dialogState.user?.name })
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {dialogState.action !== 'approve' && !isUnsuspendAction && (
                        <div className="space-y-4 my-4">
                             <div className="space-y-2">
                                <Label htmlFor="reason">{t('labels.reason')}</Label>
                                <Select onValueChange={setReason} value={reason}>
                                    <SelectTrigger id="reason">
                                        <SelectValue placeholder={t('placeholders.select_reason')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dialogState.action === 'delete' && <SelectItem value="user_request">{t('reasons.user_request')}</SelectItem>}
                                        <SelectItem value="payment_failed">{t('reasons.payment_failed')}</SelectItem>
                                        <SelectItem value="policy_violation">{t('reasons.policy_violation')}</SelectItem>
                                        <SelectItem value="spam_activity">{t('reasons.spam_activity')}</SelectItem>
                                        <SelectItem value="other">{t('reasons.other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {reason === 'other' && (
                                <div className="space-y-2">
                                    <Label htmlFor="other-reason">{t('labels.please_specify')}</Label>
                                    <Textarea id="other-reason" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder={t('placeholders.provide_reason')} />
                                </div>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setReason(""); setOtherReason(""); }}>{t('actions.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (dialogState.action === 'delete') handleDelete();
                                else if (dialogState.action === 'approve') handleStatusUpdate('Active');
                                else if (dialogState.action === 'suspend') handleStatusUpdate(dialogState.user?.status === 'Active' ? 'Suspended' : 'Active');
                            }}
                            className={cn({
                                'bg-destructive hover:bg-destructive/90 text-destructive-foreground': dialogState.action === 'delete',
                                'bg-green-600 hover:bg-green-700 text-white': dialogState.action === 'approve',
                            })}
                        >
                             {
                                {
                                    'delete': t('actions.yes_delete'),
                                    'approve': 'Yes, Approve',
                                    'suspend': dialogState.user?.status === 'Active' ? t('actions.yes_suspend') : t('actions.yes_unsuspend')
                                }[dialogState.action || '']
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
