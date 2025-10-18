
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

const promoCodes = [
    { code: "NEWFARMER10", discount: "10% off", status: "Active", uses: "12/100" },
    { code: "DIWALI2024", discount: "₹200 off", status: "Active", uses: "54/200" },
    { code: "DEALER50", discount: "50% off", status: "Expired", uses: "25/25" },
];

export default function PromoCodesPage() {
    return (
        <>
            <PageHeader title="Promo Code Management" description="Create and manage promotional codes for users.">
                <Button>
                    <PlusCircle className="mr-2" />
                    Create Promo Code
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Active & Expired Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Usage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promoCodes.map((promo) => (
                                    <TableRow key={promo.code}>
                                        <TableCell className="font-mono">{promo.code}</TableCell>
                                        <TableCell>{promo.discount}</TableCell>
                                        <TableCell>
                                            <Badge variant={promo.status === 'Active' ? 'default' : 'secondary'}>{promo.status}</Badge>
                                        </TableCell>
                                        <TableCell>{promo.uses}</TableCell>
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
