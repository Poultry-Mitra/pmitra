
"use client";

import { useState } from "react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockBatches, currentUser } from "@/lib/data";
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
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  // Assuming a mock user plan for now. In a real app, this would come from user data.
  const isPremiumUser = true; // Change to false to test the free user experience
  const activeBatches = mockBatches.filter(b => b.status === 'Active').length;

  const handleAddNewBatch = () => {
    if (!isPremiumUser && activeBatches >= 1) {
      setShowUpgradeAlert(true);
    } else {
      // Logic to add a new batch would go here
      alert("Navigating to Add New Batch page...");
    }
  };
  
  return (
    <>
      <PageHeader 
        title="My Batches"
        description="Manage all your poultry batches in one place."
      >
        <Button onClick={handleAddNewBatch}>
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

       <AlertDialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500"/>
                Free Plan Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription>
              You can only manage 1 active batch on the Free Plan. Please upgrade to the Premium Plan to add and manage unlimited batches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/pricing">Upgrade to Premium</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

