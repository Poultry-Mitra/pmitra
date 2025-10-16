
// src/hooks/use-orders.ts
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
  runTransaction,
  increment,
  serverTimestamp,
  addDoc,
  updateDoc,
  Auth,
} from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { addLedgerEntryInTransaction } from '@/hooks/use-ledger';
import { useFirestore, useAuth } from '@/firebase/provider';
import { useMemoFirebase } from '@/firebase/provider';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getAuth } from 'firebase/auth';

// Helper to convert Firestore doc to Order type
function toOrder(doc: QueryDocumentSnapshot<DocumentData>): Order {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString(),
    } as Order;
}

export function useOrders() {
    const firestore = useFirestore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Admin does not use this hook. This is a placeholder for potential future use.
    // For now, we will assume this hook is not called by an admin and won't implement a Genkit flow.
    useEffect(() => {
        setOrders([]);
        setLoading(false);
    }, []);

    return { orders, loading };
}


export function useOrdersByDealer(dealerUID?: string) {
  const firestore = useFirestore();
  const auth = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !dealerUID) return null;
    const ordersCollection = collection(firestore, 'orders');
    return query(ordersCollection, where("dealerUID", "==", dealerUID));
  }, [firestore, dealerUID]);

  useEffect(() => {
    if (!ordersQuery) {
        setOrders([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(toOrder).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders:", err);
        const contextualError = new FirestorePermissionError({
            operation: 'list',
            path: 'orders',
        }, auth);
        errorEmitter.emit('permission-error', contextualError);
        setOrders([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ordersQuery, auth]);

  return { orders, loading };
}

export function useOrdersByFarmer(farmerUID?: string) {
  const firestore = useFirestore();
  const auth = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const farmerOrdersQuery = useMemoFirebase(() => {
      if (!firestore || !farmerUID) return null;
      const ordersCollection = collection(firestore, 'orders');
      return query(
        ordersCollection, 
        where("farmerUID", "==", farmerUID)
      );
  }, [firestore, farmerUID]);

  useEffect(() => {
    if (!farmerOrdersQuery) {
        setOrders([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      farmerOrdersQuery,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(toOrder).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders by farmer:", err);
        const contextualError = new FirestorePermissionError({
            operation: 'list',
            path: 'orders',
        }, auth);
        errorEmitter.emit('permission-error', contextualError);
        setOrders([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmerOrdersQuery, auth]);

  return { orders, loading };
}


export async function createOrder(firestore: Firestore, data: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderCollection = collection(firestore, 'orders');

    const orderData = {
        ...data,
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(orderCollection, orderData);
    
    if (data.isOfflineSale) {
        const newOrder = { id: docRef.id, ...orderData, createdAt: new Date().toISOString() } as Order;
        // CRITICAL: Await the status update to ensure the transaction completes for offline sales.
        await updateOrderStatus(newOrder, 'Completed', firestore);
    }
    
    return docRef.id;
}


export async function updateOrderStatus(order: Order, newStatus: 'Approved' | 'Rejected' | 'Completed', firestore: Firestore | null, auth?: Auth | null) {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderRef = doc(firestore, 'orders', order.id);
    
    if (newStatus === 'Rejected') {
        // Use non-blocking update for simple status changes.
        await updateDocumentNonBlocking(orderRef, { status: newStatus }, auth || null);
        return;
    }

    // Use a transaction for complex operations involving multiple documents
    // (inventory, ledger, etc.) to ensure data consistency.
    await runTransaction(firestore, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
            throw new Error("Order not found.");
        }
        
        const currentStatus = orderDoc.data().status;
        if (currentStatus !== 'Pending' && !order.isOfflineSale) {
            throw new Error("This order has already been processed.");
        }
        
        // This check applies only when a farmer approves an order from a dealer.
        if (newStatus === 'Approved') {
            if (!order.productId) {
                throw new Error("Order is missing a product ID.");
            }
            const dealerInventoryRef = doc(firestore, 'dealerInventory', order.productId);
            const dealerInventoryDoc = await transaction.get(dealerInventoryRef);

            if (!dealerInventoryDoc.exists()) throw new Error("Product not found in dealer's inventory.");

            const currentQuantity = dealerInventoryDoc.data().quantity;
            if (currentQuantity < order.quantity) {
                throw new Error(`Not enough stock for ${order.productName}. Available: ${currentQuantity}, Ordered: ${order.quantity}.`);
            }
            
            transaction.update(dealerInventoryRef, {
                quantity: increment(-order.quantity)
            });
        }
        
        // Ledger entries for both Approved and Completed statuses
        if(newStatus === 'Approved' || newStatus === 'Completed') {
            const customerName = order.isOfflineSale ? order.offlineCustomerName : (await transaction.get(doc(firestore, 'users', order.farmerUID!))).data()?.name;
            await addLedgerEntryInTransaction(transaction, firestore, order.dealerUID, {
                description: `Sale to ${customerName || 'Unknown'} (Order: ${order.id.substring(0, 5)})`,
                amount: order.totalAmount,
                date: new Date().toISOString(),
            }, 'Credit');
            
            if (!order.isOfflineSale && order.farmerUID) {
                const dealerName = (await transaction.get(doc(firestore, 'users', order.dealerUID))).data()?.name;
                await addLedgerEntryInTransaction(transaction, firestore, order.farmerUID, {
                   description: `Purchase from ${dealerName || 'Unknown Dealer'} (Order: ${order.id.substring(0, 5)})`,
                   amount: order.totalAmount,
                   date: new Date().toISOString(),
               }, 'Debit');
            }
        }

        // Finally, update the order status
        transaction.update(orderRef, { status: newStatus });
    });
}
