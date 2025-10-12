

import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockBatches } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusVariant: { [key in 'Active' | 'Completed' | 'Planned']: "default" | "secondary" | "outline" } = {
    Active: "default",
    Completed: "secondary",
    Planned: "outline",
};

const statusColorScheme = {
    Active: "text-green-500 border-green-500/50 bg-green-500/10",
    Completed: "text-gray-500 border-gray-500/50 bg-gray-500/10",
    Planned: "text-blue-500 border-blue-500/50 bg-blue-500/10",
};


export default function BatchesPage() {
  return (
    <>
      <PageHeader 
        title="My Batches"
        description="Manage all your poultry batches in one place."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Add New Batch
        </Button>
      </PageHeader>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>All Batches</CardTitle>
                <CardDescription>A list of all your active, completed, and planned poultry batches.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Batch ID</TableHead>
                            <TableHead>Breed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Age (days)</TableHead>
                            <TableHead className="text-right">Avg. Weight (g)</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockBatches.map((batch) => (
                            <TableRow key={batch.id}>
                                <TableCell className="font-medium">{batch.id}</TableCell>
                                <TableCell>{batch.breed}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[batch.status]} className={cn("capitalize", statusColorScheme[batch.status])}>
                                        {batch.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{batch.quantity.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{batch.ageDays}</TableCell>
                                <TableCell className="text-right">{batch.avgWeight.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
