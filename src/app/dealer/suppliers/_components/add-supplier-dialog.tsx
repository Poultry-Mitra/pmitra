
// src/app/dealer/suppliers/_components/add-supplier-dialog.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase/provider';
import { addSupplier } from '@/hooks/use-suppliers';
import { useLanguage } from '@/components/language-provider';
import { useAppUser } from '@/app/app-provider';

const formSchema = z.object({
    name: z.string().min(2, "Supplier name is required."),
    contactPerson: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    gstin: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddSupplierDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user: dealerUser } = useAppUser();
    const { t } = useLanguage();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            contactPerson: "",
            contactNumber: "",
            address: "",
            gstin: "",
        },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore || !dealerUser || !auth) {
            toast({ title: t('messages.error'), description: t('messages.must_be_logged_in'), variant: "destructive" });
            return;
        }

        try {
            // The addSupplier function is now non-blocking, so we don't await it.
            addSupplier(firestore, auth, dealerUser.id, values);
            
            toast({
                title: "Supplier Added!",
                description: `${values.name} has been added to your list of suppliers.`,
            });
            onOpenChange(false);
            form.reset();

        } catch (error: any) {
            // This will catch the re-thrown error from the hook's catch block
            console.error("Error adding supplier:", error);
            toast({ title: "Failed to Add Supplier", description: error.message || "Could not add the supplier.", variant: "destructive" });
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                    <DialogDescription>Enter the details for a new supplier. This will make them available for future purchases.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier Company Name</FormLabel>
                                <FormControl><Input placeholder="e.g., National Feeds Ltd." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="contactPerson" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Person</FormLabel>
                                    <FormControl><Input placeholder="e.g., Mr. Sharma" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                         </div>
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address (Optional)</FormLabel>
                                <FormControl><Textarea placeholder="Enter full address" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="gstin" render={({ field }) => (
                            <FormItem>
                                <FormLabel>GSTIN (Optional)</FormLabel>
                                <FormControl><Input placeholder="27ABCDE1234F1Z5" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('actions.cancel')}</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                                {form.formState.isSubmitting ? t('actions.saving') : t('actions.save_changes')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
