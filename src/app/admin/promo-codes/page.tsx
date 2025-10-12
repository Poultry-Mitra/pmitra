
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from "@/app/admin/_components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type PromoCodeStatus = 'Active' | 'Expired' | 'Inactive';
type PromoCode = {
    id: string;
    code: string;
    discount: string;
    status: PromoCodeStatus;
    usage: string;
    expiryDate: string;
};

const initialPromoCodes: PromoCode[] = [
    { id: '1', code: 'WELCOME10', discount: '10% off', status: 'Active', usage: '56/1000', expiryDate: '2024-12-31' },
    { id: '2', code: 'DIWALI20', discount: '₹200 off', status: 'Expired', usage: '500/500', expiryDate: '2023-11-15' },
    { id: '3', code: 'NEWFARMER', discount: '15% off', status: 'Active', usage: '120/unlimited', expiryDate: '2024-08-31' },
];

const statusVariant: { [key in PromoCodeStatus]: "default" | "secondary" | "destructive" } = {
  Active: "default",
  Expired: "destructive",
  Inactive: "secondary",
};


const formSchema = z.object({
    code: z.string().min(5, "Code must be at least 5 characters.").toUpperCase(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().min(1, "Discount value must be positive."),
    expiryDate: z.date().optional(),
    usageLimit: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function CreatePromoCodeDialog({ onFormSubmit }: { onFormSubmit: (values: PromoCode) => void }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
            discountValue: 10,
        },
    });

    function onSubmit(values: FormValues) {
        console.log(values);
        const newPromo: PromoCode = {
            id: (initialPromoCodes.length + 2).toString(),
            code: values.code,
            discount: values.discountType === 'percentage' ? `${values.discountValue}% off` : `₹${values.discountValue} off`,
            status: 'Active',
            usage: `0/${values.usageLimit || 'unlimited'}`,
            expiryDate: values.expiryDate ? format(values.expiryDate, "yyyy-MM-dd") : 'No Expiry'
        };
        onFormSubmit(newPromo);
        toast({ title: "Promo Code Created", description: `Code "${values.code}" has been created successfully.` });
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Create Promo Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Promo Code</DialogTitle>
                    <DialogDescription>Fill in the details to create a new promotional offer.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Promo Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., SUMMER25" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="discountType"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="discountValue"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Value</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 10 or 100" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Expiry Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="usageLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usage Limit (optional)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Create Code</Button>
                        </DialogFooter>
                    </form>
                 </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function PromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);

    const handleFormSubmit = (newCode: PromoCode) => {
        setPromoCodes(prev => [newCode, ...prev]);
    }

    return (
        <>
            <PageHeader title="Promo Codes & Offers" description="Create and manage discounts for your users.">
                <CreatePromoCodeDialog onFormSubmit={handleFormSubmit} />
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Promo Codes</CardTitle>
                        <CardDescription>A list of all active and expired promotional codes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promoCodes.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                                        <TableCell>{promo.discount}</TableCell>
                                        <TableCell><Badge variant={statusVariant[promo.status]}>{promo.status}</Badge></TableCell>
                                        <TableCell>{promo.usage}</TableCell>
                                        <TableCell>{promo.expiryDate}</TableCell>
                                        <TableCell>
                                            {/* Actions like Edit/Deactivate can be added here */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
