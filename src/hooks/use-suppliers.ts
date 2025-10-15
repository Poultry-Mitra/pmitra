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
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

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

  const suppliersQuery = useMemoFirebase(() => {
    if (!firestore || !dealerUID) return null;
    const suppliersCollection = collection(firestore, 'suppliers');
    return query(
        suppliersCollection, 
        where("dealerUID", "==", dealerUID)
    );
  }, [firestore, dealerUID]);


  useEffect(() => {
    if (!suppliersQuery) {
        setSuppliers([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      suppliersQuery,
      (snapshot) => {
        const fetchedSuppliers = snapshot.docs.map(toSupplier);
        // Sort client-side
        fetchedSuppliers.sort((a, b) => a.name.localeCompare(b.name));
        setSuppliers(fetchedSuppliers);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching suppliers:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [suppliersQuery]);

  return { suppliers, loading };
}


export async function addSupplier(firestore: Firestore, auth: Auth, dealerUID: string, data: Omit<Supplier, 'id' | 'dealerUID' | 'createdAt'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'suppliers');
    
    const supplierData = {
        ...data,
        dealerUID,
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collectionRef, supplierData);
    } catch(e) {
        if (e instanceof Error && e.message.includes('permission-denied')) {
             errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: collectionRef.path,
                    operation: 'create',
                    requestResourceData: supplierData,
                }, auth)
             );
        }
        throw e;
    }
}
