

"use client";

import { useState } from "react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useBatches, deleteBatch } from "@/hooks/use-batches";
import type { Batch } from "@/lib/types";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore, useAuth } from '@/firebase/provider';
import { AddBatchDialog } from "./_components/add-batch-dialog";
import { useAppUser } from "@/app/app-provider";


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
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: appUser, loading: appUserLoading } = useAppUser();

  const { batches, loading: batchesLoading } = useBatches(appUser?.id || '');
  const [isAddBatchOpen, setAddBatchOpen] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<Batch | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const loading = appUserLoading || batchesLoading;
  
  const isPremiumUser = appUser?.planType === 'premium';
  const activeBatchesCount = batches.filter(b => b.status === 'Active').length;

  const handleAddNewBatchClick = () => {
    if (!isPremiumUser && activeBatchesCount >= 1) {
      setShowUpgradeAlert(true);
    } else {
      setAddBatchOpen(true);
    }
  };

  const handleDeleteBatch = () => {
    if(showDeleteAlert && firestore && appUser && auth) {
      deleteBatch(firestore, auth, showDeleteAlert.id);
      toast({
        title: "Batch Deleted",
        description: `Batch ${showDeleteAlert.batchName} has been deleted.`,
        variant: "destructive"
      });
      setShowDeleteAlert(null);
    }
  }

  const handleRowClick = (batchId: string) => {
    router.push(`/batches/${batchId}`);
  };
  
  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>

  return (
    <>
      <PageHeader 
        title="My Batches"
        description="Manage all your poultry batches in one place."
      >
        <Button onClick={handleAddNewBatchClick}>
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
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Batch Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Age (days)</TableHead>
                            <TableHead className="text-right">Avg. Weight (g)</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <div className="flex justify-center items-center p-4">
                                        <Loader2 className="animate-spin mr-2" /> Loading batches...
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && batches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center p-8">
                                    No batches found. Click "Add New Batch" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && batches.map((batch) => {
                          const ageInMs = new Date().getTime() - new Date(batch.batchStartDate).getTime();
                          const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
                          return(
                            <TableRow key={batch.id} onClick={() => handleRowClick(batch.id)} className="cursor-pointer">
                                <TableCell className="font-medium">{batch.batchName}</TableCell>
                                <TableCell>{batch.breed ? `${batch.batchType} (${batch.breed})` : batch.batchType}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[batch.status]} className={cn("capitalize", statusColorScheme[batch.status])}>
                                        {batch.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{batch.totalChicks.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{ageInDays}</TableCell>
                                <TableCell className="text-right">{batch.avgBodyWeight.toLocaleString()}</TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/batches/${batch.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteAlert(batch)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <AddBatchDialog open={isAddBatchOpen} onOpenChange={setAddBatchOpen} />

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

      <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive"/>
                Delete Batch
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the batch "{showDeleteAlert?.batchName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBatch} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
