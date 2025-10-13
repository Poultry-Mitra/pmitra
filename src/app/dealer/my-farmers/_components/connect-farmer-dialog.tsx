
// src/app/dealer/my-farmers/_components/connect-farmer-dialog.tsx
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
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import type { User } from '@/lib/types';

const formSchema = z.object({
    farmerId: z.string().min(1, "Please enter a Farmer ID.").regex(/^PM-FARM-[A-Z0-9]{5}$/, "Invalid Farmer ID format. e.g., PM-FARM-ABC12"),
});

type FormValues = z.infer<typeof formSchema>;

export function ConnectFarmerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: dealerUser } = useUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            farmerId: "",
        },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore || !dealerUser) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        try {
            // Find the farmer by their PoultryMitra ID.
            const farmerUIDprefix = values.farmerId.split('-').pop()?.toLowerCase();
            if (!farmerUIDprefix) {
                throw new Error("Invalid Farmer ID format.");
            }
            
            const usersCollection = collection(firestore, 'users');
            const q = query(usersCollection, where("role", "==", "farmer"), limit(500)); // Limit to prevent large reads
            const querySnapshot = await getDocs(q);

            let foundFarmer: (User & { id: string }) | null = null;
            querySnapshot.forEach(doc => {
                if (doc.id.toLowerCase().startsWith(farmerUIDprefix)) {
                    foundFarmer = { id: doc.id, ...doc.data() } as User & { id: string };
                }
            });

            if (!foundFarmer) {
                 throw new Error("No farmer found with that PoultryMitra ID.");
            }

            const connectionsCollection = collection(firestore, 'connections');
             await addDoc(connectionsCollection, {
                dealerUID: dealerUser.uid,
                farmerUID: foundFarmer.id, 
                status: 'Pending',
                requestedBy: 'dealer',
                createdAt: serverTimestamp(),
            });


            toast({
                title: "Connection Request Sent!",
                description: `A connection request has been sent to farmer ${foundFarmer.name}.`,
            });
            onOpenChange(false);
            form.reset();

        } catch (error: any) {
            console.error("Error connecting with farmer:", error);
            toast({ title: "Connection Failed", description: error.message || "Could not connect with the farmer.", variant: "destructive" });
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect with a New Farmer</DialogTitle>
                    <DialogDescription>Enter the farmer's unique PoultryMitra ID to send a connection request. They will need to approve it.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                         <FormField
                            control={form.control}
                            name="farmerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Farmer's PoultryMitra ID</FormLabel>
                                    <FormControl><Input placeholder="e.g., PM-FARM-ABC12" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                {form.formState.isSubmitting ? 'Connecting...' : 'Send Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
