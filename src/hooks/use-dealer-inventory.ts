
// src/hooks/use-dealer-inventory.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { DealerInventoryItem } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to DealerInventoryItem type
function toDealerInventoryItem(doc: QueryDocumentSnapshot<DocumentData>): DealerInventoryItem {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    const item = {
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt,
    } as DealerInventoryItem;

    // Ensure quantity is always a number
    if (typeof item.quantity !== 'number') {
        item.quantity = 0;
    }
     // Ensure lowStockThreshold is a number, default to 10 if not present
    if (typeof item.lowStockThreshold !== 'number') {
        item.lowStockThreshold = 10;
    }


    return item;
}

export function useDealerInventory(dealerUID: string | undefined) {
  const firestore = useFirestore();
  const [inventory, setInventory] = useState<DealerInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !dealerUID) {
        setInventory([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const inventoryCollection = collection(firestore, 'dealerInventory');
    const q = query(
        inventoryCollection, 
        where("dealerUID", "==", dealerUID),
        orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setInventory(snapshot.docs.map(toDealerInventoryItem));
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `dealerInventory where dealerUID == ${dealerUID}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching dealer inventory:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, dealerUID]);

  return { inventory, loading };
}

export function addDealerInventoryItem(firestore: Firestore, dealerUID: string, data: Omit<DealerInventoryItem, 'id' | 'dealerUID' | 'updatedAt'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'dealerInventory');
    
    const itemData = {
        ...data,
        dealerUID,
        lowStockThreshold: data.lowStockThreshold || 10,
        updatedAt: serverTimestamp(),
    };

    addDoc(collectionRef, itemData).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'dealerInventory',
            operation: 'create',
            requestResourceData: itemData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw for the form to catch
    });
}

export function updateDealerInventoryItem(firestore: Firestore, itemId: string, data: Partial<Pick<DealerInventoryItem, 'quantity' | 'ratePerUnit' | 'lowStockThreshold'>>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const docRef = doc(firestore, 'dealerInventory', itemId);
    
    const itemData = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    updateDoc(docRef, itemData).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: itemData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
