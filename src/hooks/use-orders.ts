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
import { useFirestore } from '@/firebase/provider';
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

export async function updateOrderStatus(orderId: string, newStatus: 'Approved' | 'Rejected', firestore: Firestore | null) {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderRef = doc(firestore, 'orders', orderId);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists() || orderDoc.data().status !== 'Pending') {
                throw new Error("Order not found or has already been processed.");
            }
            
            const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;


            // Update the order status
            transaction.update(orderRef, { status: newStatus });

            // If the order is approved, deduct inventory and create ledger entries
            if (newStatus === 'Approved') {
                if (!orderData.productId) {
                    throw new Error("Order is missing a product ID.");
                }
                const dealerInventoryRef = doc(firestore, 'dealerInventory', orderData.productId);
                const farmerDocSnap = await transaction.get(doc(firestore, 'users', orderData.farmerUID));
                const dealerInventoryDoc = await transaction.get(dealerInventoryRef);
                
                const dealerDocSnap = await transaction.get(doc(firestore, 'users', orderData.dealerUID));


                if (!dealerInventoryDoc.exists()) throw new Error("Product not found in dealer's inventory.");
                if (!farmerDocSnap.exists()) throw new Error("Farmer not found.");
                if (!dealerDocSnap.exists()) throw new Error("Dealer not found.");

                const farmerName = farmerDocSnap.data().name;
                const dealerName = dealerDocSnap.data().name;
                const currentQuantity = dealerInventoryDoc.data().quantity;
                if (currentQuantity < orderData.quantity) {
                    throw new Error("Not enough stock available to fulfill the order.");
                }

                // 1. Reduce dealer's inventory
                transaction.update(dealerInventoryRef, {
                    quantity: increment(-orderData.quantity)
                });
                
                // 2. Add credit entry to dealer's ledger
                await addLedgerEntryInTransaction(transaction, firestore, orderData.dealerUID, {
                    description: `Sale to ${farmerName} (Order: ${orderData.id.substring(0, 5)})`,
                    amount: orderData.totalAmount,
                    date: new Date().toISOString(),
                }, 'Credit');

                // 3. Add debit entry to farmer's ledger
                 await addLedgerEntryInTransaction(transaction, firestore, orderData.farmerUID, {
                    description: `Purchase from ${dealerName} (Order: ${orderData.id.substring(0, 5)})`,
                    amount: orderData.totalAmount,
                    date: new Date().toISOString(),
                }, 'Debit');
            }
        });
    } catch (e: any) {
        console.error("Error updating order status: ", e);
        // Avoid re-throwing permission errors if they originate from sub-operations like ledger writes
        if (!(e instanceof FirestorePermissionError)) {
            const permissionError = new FirestorePermissionError({
                path: orderRef.path,
                operation: 'update',
                requestResourceData: { status: newStatus },
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw e;
    }
}
