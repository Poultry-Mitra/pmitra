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
import { useFirestore } from '@/firebase/provider';
import { useMemoFirebase } from '@/firebase/provider';

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

  const allOrdersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy("createdAt", "desc"));
  }, [firestore]);

  useEffect(() => {
    if (!allOrdersQuery) {
        setOrders([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      allOrdersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map(toOrder));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching all orders:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [allOrdersQuery]);

  return { orders, loading };
}


export function useOrdersByDealer(dealerUID?: string) {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !dealerUID) return null;
    const ordersCollection = collection(firestore, 'orders');
    return query(ordersCollection, where("dealerUID", "==", dealerUID), orderBy("createdAt", "desc"));
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
        setOrders(snapshot.docs.map(toOrder));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ordersQuery]);

  return { orders, loading };
}

export function useOrdersByFarmer(farmerUID?: string) {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const farmerOrdersQuery = useMemoFirebase(() => {
      if (!firestore || !farmerUID) return null;
      const ordersCollection = collection(firestore, 'orders');
      return query(
        ordersCollection, 
        where("farmerUID", "==", farmerUID),
        orderBy("createdAt", "desc")
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
        setOrders(snapshot.docs.map(toOrder));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders by farmer:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmerOrdersQuery]);

  return { orders, loading };
}


export async function createOrder(firestore: Firestore, auth: Auth, data: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore || !auth) throw new Error("Firestore or Auth not initialized");

    const orderCollection = collection(firestore, 'orders');

    const orderData = {
        ...data,
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(orderCollection, orderData);
    
    if (data.isOfflineSale) {
        const newOrder = { id: docRef.id, ...orderData, createdAt: new Date().toISOString() } as Order;
        await updateOrderStatus(newOrder, 'Completed', firestore, auth);
    }
    
    return docRef.id;
}


export async function updateOrderStatus(order: Order, newStatus: 'Approved' | 'Rejected' | 'Completed', firestore: Firestore | null, auth: Auth | null) {
    if (!firestore || !auth) throw new Error("Firestore or Auth not initialized");

    const orderRef = doc(firestore, 'orders', order.id);
    
    if (newStatus === 'Rejected') {
        await updateDoc(orderRef, { status: newStatus });
        return;
    }

    await runTransaction(firestore, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
            throw new Error("Order not found.");
        }
        
        const currentStatus = orderDoc.data().status;
        if (currentStatus !== 'Pending' && !order.isOfflineSale) {
            throw new Error("This order has already been processed.");
        }
        
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

        transaction.update(orderRef, { status: newStatus });
    });
}
