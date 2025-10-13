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
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import type { Order } from '@/lib/types';
import { addLedgerEntryInTransaction } from '@/hooks/use-ledger';

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
  const { user: authUser } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !authUser) {
        setOrders([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const ordersCollection = collection(firestore, 'orders');

    const q = dealerUID 
      ? query(ordersCollection, where("dealerUID", "==", dealerUID), orderBy("createdAt", "desc"))
      : query(ordersCollection, orderBy("createdAt", "desc")); // Admin query for all orders


    const unsubscribe = onSnapshot(
      q,
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
  }, [firestore, dealerUID, authUser]);

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

    await addDoc(orderCollection, orderData);
}

export async function updateOrderStatus(order: Order, newStatus: 'Approved' | 'Rejected', firestore: Firestore | null) {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderRef = doc(firestore, 'orders', order.id);
    
    if (newStatus === 'Rejected') {
        await updateDoc(orderRef, { status: newStatus });
        return;
    }

    await runTransaction(firestore, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists() || orderDoc.data().status !== 'Pending') {
            throw new Error("Order not found or has already been processed.");
        }
        
        // Update the order status
        transaction.update(orderRef, { status: newStatus });

        // If the order is approved, deduct inventory and create ledger entries
        if (newStatus === 'Approved') {
            if (!order.productId) {
                throw new Error("Order is missing a product ID.");
            }
            const dealerInventoryRef = doc(firestore, 'dealerInventory', order.productId);
            
            const farmerDocSnap = await transaction.get(doc(firestore, 'users', order.farmerUID));
            const dealerInventoryDoc = await transaction.get(dealerInventoryRef);
            const dealerDocSnap = await transaction.get(doc(firestore, 'users', order.dealerUID));


            if (!dealerInventoryDoc.exists()) throw new Error("Product not found in dealer's inventory.");
            if (!farmerDocSnap.exists()) throw new Error("Farmer not found.");
            if (!dealerDocSnap.exists()) throw new Error("Dealer not found.");

            const farmerName = farmerDocSnap.data().name;
            const dealerName = dealerDocSnap.data().name;
            const currentQuantity = dealerInventoryDoc.data().quantity;
            if (currentQuantity < order.quantity) {
                throw new Error("Not enough stock available to fulfill the order.");
            }

            // 1. Reduce dealer's inventory
            transaction.update(dealerInventoryRef, {
                quantity: increment(-order.quantity)
            });
            
            // 2. Add credit entry to dealer's ledger
            await addLedgerEntryInTransaction(transaction, firestore, order.dealerUID, {
                description: `Sale to ${farmerName} (Order: ${order.id.substring(0, 5)})`,
                amount: order.totalAmount,
                date: new Date().toISOString(),
            }, 'Credit');

            // 3. Add debit entry to farmer's ledger
             await addLedgerEntryInTransaction(transaction, firestore, order.farmerUID, {
                description: `Purchase from ${dealerName} (Order: ${order.id.substring(0, 5)})`,
                amount: order.totalAmount,
                date: new Date().toISOString(),
            }, 'Debit');
        }
    });
}
