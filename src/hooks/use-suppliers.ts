
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
} from 'firebase/firestore';
import type { Supplier } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';

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


export async function addSupplier(firestore: Firestore, dealerUID: string, data: Omit<Supplier, 'id' | 'dealerUID' | 'createdAt'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'suppliers');
    
    const supplierData = {
        ...data,
        dealerUID,
        createdAt: new Date().toISOString(),
    };

    await addDoc(collectionRef, supplierData);
}
