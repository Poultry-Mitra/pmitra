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
  addDoc,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import type { Order, User } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { addLedgerEntryInTransaction } from './use-ledger';

// Helper to convert Firestore doc to Order type
function toOrder(doc: QueryDocumentSnapshot<DocumentData>): Order {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
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

export function useOrdersByFarmer(farmerUID?: string) {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !farmerUID) {
        setOrders([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const ordersCollection = collection(firestore, 'orders');
    const q = query(
        ordersCollection, 
        where("farmerUID", "==", farmerUID),
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
          path: `orders where farmerUID == ${farmerUID}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching orders by farmer:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, farmerUID]);

  return { orders, loading };
}


export async function createOrder(firestore: Firestore, data: Omit<Order, 'id' | 'createdAt'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderCollection = collection(firestore, 'orders');

    const orderData = {
        ...data,
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(orderCollection, orderData);
    } catch(e: any) {
         console.error("Error creating order: ", e);
        const permissionError = new FirestorePermissionError({
            path: 'orders',
            operation: 'create',
            requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
    }
}

export async function updateOrderStatus(firestore: Firestore, order: Order, newStatus: Order['status'], dealerUser: User) {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderRef = doc(firestore, 'orders', order.id);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            // Update the order status
            transaction.update(orderRef, { status: newStatus });

            // If the order is approved, decrease the dealer's inventory
            // AND create ledger entries for both farmer and dealer
            if (newStatus === 'Approved') {
                if (!order.productId) {
                    throw new Error("Order is missing a product ID.");
                }
                const inventoryRef = doc(firestore, 'dealerInventory', order.productId);
                const inventoryDoc = await transaction.get(inventoryRef);

                if (!inventoryDoc.exists()) {
                    throw new Error("Product not found in dealer's inventory.");
                }

                const currentQuantity = inventoryDoc.data().quantity;
                if (currentQuantity < order.quantity) {
                    throw new Error("Not enough stock available to fulfill the order.");
                }

                // 1. Reduce dealer's inventory
                transaction.update(inventoryRef, {
                    quantity: increment(-order.quantity)
                });
                
                const now = new Date().toISOString();
                
                // 2. Add Debit entry to farmer's ledger
                const farmerLedgerDescription = `Purchased ${order.productName} from ${dealerUser.name}`;
                await addLedgerEntryInTransaction(transaction, firestore, order.farmerUID, {
                    description: farmerLedgerDescription,
                    amount: order.totalAmount,
                    date: now,
                    orderId: order.id,
                }, 'Debit');


                // 3. Add Credit entry to dealer's ledger
                // In a real app, you would fetch farmer's name, but for now we'll use their UID as it's available
                const dealerLedgerDescription = `Sold ${order.productName} to farmer ${order.farmerUID.substring(0, 5)}`;
                 await addLedgerEntryInTransaction(transaction, firestore, order.dealerUID, {
                    description: dealerLedgerDescription,
                    amount: order.totalAmount,
                    date: now,
                    orderId: order.id,
                }, 'Credit');
            }
        });
    } catch (e: any) {
        console.error("Error updating order status and creating ledger entries: ", e);
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: { status: newStatus },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
    }
}
