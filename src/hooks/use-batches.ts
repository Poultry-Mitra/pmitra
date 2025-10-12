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
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Batch } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to Batch type
function toBatch(doc: QueryDocumentSnapshot<DocumentData>): Batch {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        batchStartDate: data.batchStartDate,
        createdAt: data.createdAt,
    } as Batch;
}

export function useBatches() {
  const firestore = useFirestore();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(firestore, 'batches'),
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
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  return { batches, loading };
}

export function addBatch(data: Omit<Batch, 'id' | 'createdAt'>) {
    const { firestore } = initializeFirebase();
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'batches');
    
    addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'batches',
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function deleteBatch(batchId: string) {
    const { firestore } = initializeFirebase();
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

// HACK: Need to re-import this because of circular dependencies
// This should be solved by having a single entry point for firebase services
import { initializeFirebase } from '@/firebase';
