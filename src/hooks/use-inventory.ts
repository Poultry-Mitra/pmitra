
// src/hooks/use-inventory.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  query,
  where,
  doc,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { InventoryItem } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to InventoryItem type
function toInventoryItem(doc: QueryDocumentSnapshot<DocumentData>): InventoryItem {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        lastUpdated: data.lastUpdated,
    } as InventoryItem;
}

export function useInventory(farmerUID: string) {
  const firestore = useFirestore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !farmerUID) {
        setInventory([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    // Note: The collection is named 'inventory', not 'users/${farmerUID}/inventory'
    // Security rules will enforce that a user can only read their own inventory.
    const inventoryCollection = collection(firestore, 'inventory');
    const q = query(inventoryCollection, where("farmerUID", "==", farmerUID));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setInventory(snapshot.docs.map(toInventoryItem));
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `inventory where farmerUID == ${farmerUID}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching inventory:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, farmerUID]);

  return { inventory, loading };
}

export function useInventoryByCategory(farmerUID: string, category: InventoryItem['category']) {
  const firestore = useFirestore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !farmerUID) {
        setInventory([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const inventoryCollection = collection(firestore, 'inventory');
    const q = query(
      inventoryCollection, 
      where("farmerUID", "==", farmerUID),
      where("category", "==", category),
      where("stockQuantity", ">", 0) // Only show items that are in stock
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setInventory(snapshot.docs.map(toInventoryItem));
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `inventory where farmerUID == ${farmerUID} and category == ${category}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Error fetching inventory for category ${category}:`, err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, farmerUID, category]);

  return { inventory, loading };
}


export async function addInventoryItem(firestore: Firestore, farmerUID: string, data: Omit<InventoryItem, 'id' | 'farmerUID' | 'lastUpdated'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'inventory');
    
    const docData = {
        ...data,
        farmerUID,
        lastUpdated: serverTimestamp(),
    };

    addDoc(collectionRef, docData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'inventory',
            operation: 'create',
            requestResourceData: docData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw for form error handling
    });
}
