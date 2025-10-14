
// src/hooks/use-suppliers.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  Auth,
} from 'firebase/firestore';
import type { Supplier } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Helper to convert Firestore doc to Supplier type
function toSupplier(doc: QueryDocumentSnapshot<DocumentData>): Supplier {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    return {
        id: doc.id,
        ...data,
        createdAt: createdAt,
    } as Supplier;
}

export function useSuppliers(dealerUID: string | undefined) {
  const firestore = useFirestore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !dealerUID) {
        setSuppliers([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const suppliersCollection = collection(firestore, 'suppliers');
    const q = query(
        suppliersCollection, 
        where("dealerUID", "==", dealerUID),
        orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSuppliers(snapshot.docs.map(toSupplier));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching suppliers:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, dealerUID]);

  return { suppliers, loading };
}


export function addSupplier(firestore: Firestore, auth: Auth | null, dealerUID: string, data: Omit<Supplier, 'id' | 'dealerUID' | 'createdAt'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'suppliers');
    
    const supplierData = {
        ...data,
        dealerUID,
        createdAt: serverTimestamp(),
    };

    // Non-blocking write with contextual error handling
    addDocumentNonBlocking(collectionRef, supplierData, auth);
}
