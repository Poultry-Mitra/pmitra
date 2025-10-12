
// src/hooks/use-batches.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  query,
  where,
  runTransaction,
  orderBy,
  increment,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Batch, DailyRecord } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to Batch type
function toBatch(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Batch {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        ...data,
        batchStartDate: data.batchStartDate,
        createdAt: data.createdAt,
    } as Batch;
}

// Helper to convert Firestore doc to DailyRecord type
function toDailyRecord(doc: QueryDocumentSnapshot<DocumentData>): DailyRecord {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: data.date,
    } as DailyRecord;
}


export function useBatches(farmerUID: string) {
  const firestore = useFirestore();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !farmerUID) {
        setBatches([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const batchesCollection = collection(firestore, 'batches');
    const q = query(batchesCollection, where("farmerUID", "==", farmerUID));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setBatches(snapshot.docs.map(toBatch));
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'batches',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching batches:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, farmerUID]);

  return { batches, loading };
}

export function useBatch(batchId: string) {
    const firestore = useFirestore();
    const [batch, setBatch] = useState<Batch | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !batchId) {
            setLoading(false);
            return;
        };

        setLoading(true);
        const docRef = doc(firestore, 'batches', batchId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setBatch(toBatch(doc));
            } else {
                setBatch(null);
                console.warn(`Batch with id ${batchId} not found.`);
            }
            setLoading(false);
        },
        async (err) => {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, batchId]);

    return { batch, loading };
}


export function useDailyRecords(batchId: string) {
    const firestore = useFirestore();
    const [records, setRecords] = useState<DailyRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !batchId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const recordsCollection = collection(firestore, `batches/${batchId}/dailyRecords`);
        const q = query(recordsCollection, orderBy("date", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecords(snapshot.docs.map(toDailyRecord));
            setLoading(false);
        }, (err) => {
            const permissionError = new FirestorePermissionError({
                path: `batches/${batchId}/dailyRecords`,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error("Error fetching daily records:", err);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [firestore, batchId]);

    return { records, loading };
}


export function addBatch(firestore: Firestore, farmerUID: string, data: Omit<Batch, 'id' | 'createdAt' | 'farmerUID'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'batches');
    
    addDoc(collectionRef, {
        ...data,
        farmerUID,
        createdAt: serverTimestamp(),
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'batches',
            operation: 'create',
            requestResourceData: { ...data, farmerUID },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function deleteBatch(firestore: Firestore, batchId: string) {
    if (!firestore) throw new Error("Firestore not initialized");

    const docRef = doc(firestore, 'batches', batchId);

    deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export async function addDailyRecord(
    firestore: Firestore, 
    farmerUID: string,
    batchId: string, 
    data: { date: Date; mortality: number; feedItemId?: string; feedConsumed: number; avgBodyWeight: number; }
) {
    if (!firestore) throw new Error("Firestore not initialized");
    
    const batchRef = doc(firestore, 'batches', batchId);
    const dailyRecordRef = doc(collection(firestore, `batches/${batchId}/dailyRecords`));
    const inventoryItemRef = data.feedItemId ? doc(firestore, `inventory`, data.feedItemId) : null;


    try {
        await runTransaction(firestore, async (transaction) => {
            const batchDoc = await transaction.get(batchRef);
            if (!batchDoc.exists()) {
                throw new Error("Batch does not exist!");
            }

            // Update main batch document
            transaction.update(batchRef, {
                mortalityCount: increment(data.mortality),
                feedConsumed: increment(data.feedConsumed),
                avgBodyWeight: data.avgBodyWeight,
            });
            
            // Create new daily record in subcollection
            transaction.set(dailyRecordRef, {
                date: data.date.toISOString(),
                mortality: data.mortality,
                feedConsumed: data.feedConsumed,
                avgBodyWeight: data.avgBodyWeight,
                feedItemId: data.feedItemId || null,
                createdAt: serverTimestamp(),
            });

            // If feed was consumed, update inventory
            if (inventoryItemRef && data.feedConsumed > 0) {
                 const inventoryDoc = await transaction.get(inventoryItemRef);
                 if (!inventoryDoc.exists()) {
                    throw new Error("Feed item does not exist in inventory!");
                 }
                 const currentStock = inventoryDoc.data().stockQuantity;
                 if (currentStock < data.feedConsumed) {
                    throw new Error("Not enough feed in stock!");
                 }
                 transaction.update(inventoryItemRef, {
                    stockQuantity: increment(-data.feedConsumed),
                    lastUpdated: serverTimestamp()
                 });
            }
        });
    } catch(e: any) {
        console.error("Add daily record transaction failed: ", e);
        // Avoid double-emitting if it's already a permission error from a sub-operation
        if (!(e instanceof FirestorePermissionError)) {
             const permissionError = new FirestorePermissionError({
                path: batchRef.path, // Use the main batch path for the overall transaction
                operation: 'update',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw e;
    }
}
