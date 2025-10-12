// src/hooks/use-orders.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Order } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to Order type
function toOrder(doc: QueryDocumentSnapshot<DocumentData>): Order {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
    } as Order;
}

export function useOrders(dealerUID?: string) {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !dealerUID) {
        setOrders([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const ordersCollection = collection(firestore, 'orders');
    const q = query(
        ordersCollection, 
        where("dealerUID", "==", dealerUID),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshot.docs.map(toOrder));
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `orders where dealerUID == ${dealerUID}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, dealerUID]);

  return { orders, loading };
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const firestore = useFirestore();
    if (!firestore) throw new Error("Firestore not initialized");

    const orderRef = doc(firestore, 'orders', orderId);

    try {
        await updateDoc(orderRef, { status: status });
    } catch(e: any) {
        console.error("Error updating order status: ", e);
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: { status },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
    }
}
