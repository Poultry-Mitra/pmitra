
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
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Batch } from '@/lib/types';
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

export function useBatches(farmerUID: string) {
  const firestore = useFirestore();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !farmerUID) {
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
                // TODO: Add security rule check to ensure user can only access their own batch.
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

    