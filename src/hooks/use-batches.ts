
// src/hooks/use-batches.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
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
  addDoc,
  deleteDoc,
  type Auth,
} from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import type { Batch, DailyRecord } from '@/lib/types';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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


export function useBatches(farmerUID: string | undefined) {
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
      (err) => {
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
        (err) => {
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
            console.error("Error fetching daily records:", err);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [firestore, batchId]);

    return { records, loading };
}


export function addBatch(firestore: Firestore, auth: Auth, farmerUID: string, data: Omit<Batch, 'id' | 'createdAt' | 'farmerUID'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'batches');
    
    const batchData = {
        ...data,
        farmerUID,
        createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collectionRef, batchData, auth);
}

export function deleteBatch(firestore: Firestore, auth: Auth, batchId: string) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'batches', batchId);
    deleteDocumentNonBlocking(docRef, auth);
}

export async function addDailyRecord(
    firestore: Firestore, 
    farmerUID: string,
    batchId: string, 
    data: { 
        date: Date; 
        mortality: number; 
        feedItemId?: string; 
        feedConsumed: number; 
        avgBodyWeight: number;
        medicationGiven?: string;
        notes?: string;
    }
) {
    if (!firestore) throw new Error("Firestore not initialized");
    
    const batchRef = doc(firestore, 'batches', batchId);
    const dailyRecordRef = doc(collection(firestore, `batches/${batchId}/dailyRecords`));
    const inventoryItemRef = data.feedItemId ? doc(firestore, 'inventory', data.feedItemId) : null;


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
            medicationGiven: data.medicationGiven || "",
            notes: data.notes || "",
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
}
