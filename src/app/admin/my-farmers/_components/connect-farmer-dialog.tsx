
// src/app/admin/my-farmers/_components/connect-farmer-dialog.tsx
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
import { Send } from 'lucide-react';

const formSchema = z.object({
    farmerId: z.string().min(6, "Please enter a valid Farmer ID."),
});

type FormValues = z.infer<typeof formSchema>;

export function ConnectFarmerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            farmerId: "",
        },
    });

    async function onSubmit(values: FormValues) {
        // In a real app, this would create a 'connection' document in Firestore with 'pending' status.
        console.log("Sending connection request to farmer:", values.farmerId);
        toast({
            title: "Connection Request Sent",
            description: `A connection request has been sent to the farmer with ID: ${values.farmerId}.`,
        });
        onOpenChange(false);
        form.reset();
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
                            <Button type="submit">
                                <Send className="mr-2" />
                                Send Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
