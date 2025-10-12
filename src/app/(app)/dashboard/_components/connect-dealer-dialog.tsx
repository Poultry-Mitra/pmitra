// src/app/(app)/dashboard/_components/connect-dealer-dialog.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase/provider';
import { requestDealerConnection } from '@/hooks/use-users';

const formSchema = z.object({
    dealerCode: z.string().min(1, "Please enter a Dealer Code."),
});

type FormValues = z.infer<typeof formSchema>;

export function ConnectDealerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const farmerUser = useUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dealerCode: "",
        },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore || !farmerUser) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        try {
            const dealer = await requestDealerConnection(firestore, farmerUser.uid, values.dealerCode);

            toast({
                title: "Connection Request Sent!",
                description: `A connection request has been sent to ${dealer.name}. You will be able to order from them once they approve.`,
            });
            onOpenChange(false);
            form.reset();

        } catch (error: any) {
            console.error("Error connecting with dealer:", error);
            toast({ title: "Connection Failed", description: error.message || "Could not connect with the dealer.", variant: "destructive" });
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect with a Dealer</DialogTitle>
                    <DialogDescription>Enter your dealer's unique code to connect with them. This will allow them to send you orders.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                         <FormField
                            control={form.control}
                            name="dealerCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dealer's Unique Code</FormLabel>
                                    <FormControl><Input placeholder="e.g., DEAL-ABCDE" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                {form.formState.isSubmitting ? 'Sending Request...' : 'Send Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
