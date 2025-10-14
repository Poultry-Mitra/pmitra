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

// Helper to convert Firestore doc to Supplier type
function toSupplier(doc: QueryDocumentSnapshot<DocumentData>): Supplier {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
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


export function addSupplier(firestore: Firestore, auth: Auth, dealerUID: string, data: Omit<Supplier, 'id' | 'dealerUID' | 'createdAt'>) {
    if (!firestore || !auth) throw new Error("Firestore or Auth not initialized");

    const collectionRef = collection(firestore, 'suppliers');
    
    const supplierData = {
        ...data,
        dealerUID,
        createdAt: new Date().toISOString(),
    };

    // Non-blocking write with contextual error handling
    addDoc(collectionRef, supplierData)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: supplierData,
            }, auth);
            errorEmitter.emit('permission-error', permissionError);
            
            // Allow the original error to be caught by the component's try/catch block
            // to show a user-facing toast notification.
            throw serverError;
        });
}
