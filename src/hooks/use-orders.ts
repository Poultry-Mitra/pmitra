
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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString(),
    } as Order;
}


export function useOrders(dealerUID?: string) {
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
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
        console.error("Error fetching orders by farmer:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, farmerUID]);

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
    
    // If it's an offline sale, immediately run the approval transaction
    if (data.isOfflineSale) {
        const newOrder = { id: docRef.id, ...orderData, createdAt: new Date().toISOString() } as Order;
        await updateOrderStatus(newOrder, 'Completed', firestore);
    }
    
    return docRef.id;
}


export async function updateOrderStatus(order: Order, newStatus: 'Approved' | 'Rejected' | 'Completed', firestore: Firestore | null) {
    if (!firestore) throw new Error("Firestore not initialized");

    const orderRef = doc(firestore, 'orders', order.id);
    
    // For simple rejection, just update the status
    if (newStatus === 'Rejected') {
        await updateDoc(orderRef, { status: newStatus });
        return;
    }

    // Use a transaction for Approved/Completed status to ensure atomicity
    await runTransaction(firestore, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
            throw new Error("Order not found.");
        }
        
        const currentStatus = orderDoc.data().status;
        // Prevent re-processing an already processed order
        if (currentStatus !== 'Pending' && !order.isOfflineSale) {
            throw new Error("This order has already been processed.");
        }
        
        // Update the order status
        transaction.update(orderRef, { status: newStatus });
        
        // --- Shared Logic for Approved/Completed Orders ---
        if (!order.productId) {
            throw new Error("Order is missing a product ID.");
        }
        const dealerInventoryRef = doc(firestore, 'dealerInventory', order.productId);
        const dealerInventoryDoc = await transaction.get(dealerInventoryRef);

        if (!dealerInventoryDoc.exists()) throw new Error("Product not found in dealer's inventory.");

        const currentQuantity = dealerInventoryDoc.data().quantity;
        if (currentQuantity < order.quantity) {
            throw new Error("Not enough stock available to fulfill the order.");
        }
        
        // 1. Reduce dealer's inventory
        transaction.update(dealerInventoryRef, {
            quantity: increment(-order.quantity)
        });

        // 2. Add credit entry to dealer's ledger
        const customerName = order.isOfflineSale ? order.offlineCustomerName : (await transaction.get(doc(firestore, 'users', order.farmerUID!))).data()?.name;
        await addLedgerEntryInTransaction(transaction, firestore, order.dealerUID, {
            description: `Sale to ${customerName || 'Unknown'} (Order: ${order.id.substring(0, 5)})`,
            amount: order.totalAmount,
            date: new Date().toISOString(),
        }, 'Credit');
        
        // 3. If it's an online sale, add debit entry to farmer's ledger
        if (!order.isOfflineSale && order.farmerUID) {
            const dealerName = (await transaction.get(doc(firestore, 'users', order.dealerUID))).data()?.name;
            await addLedgerEntryInTransaction(transaction, firestore, order.farmerUID, {
               description: `Purchase from ${dealerName || 'Unknown Dealer'} (Order: ${order.id.substring(0, 5)})`,
               amount: order.totalAmount,
               date: new Date().toISOString(),
           }, 'Debit');
        }
    });
}
