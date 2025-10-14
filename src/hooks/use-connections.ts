
// src/hooks/use-connections.ts
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
  runTransaction,
  arrayUnion,
  Auth,
} from 'firebase/firestore';
import type { Connection } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Helper to convert Firestore doc to Connection type
function toConnection(doc: QueryDocumentSnapshot<DocumentData>): Connection {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    } as Connection;
}

export function useConnections(userId: string | undefined, userRole: 'farmer' | 'dealer') {
  const firestore = useFirestore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !userId) {
        setConnections([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const connectionsCollection = collection(firestore, 'connections');
    const field = userRole === 'farmer' ? 'farmerUID' : 'dealerUID';

    const q = query(
        connectionsCollection, 
        where(field, "==", userId),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setConnections(snapshot.docs.map(toConnection));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching connections:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, userId, userRole]);

  return { connections, loading };
}

export async function updateConnectionStatus(firestore: Firestore, auth: Auth | null, connectionId: string, newStatus: 'Approved' | 'Rejected') {
    if (!firestore) throw new Error("Firestore not initialized");

    const connectionRef = doc(firestore, 'connections', connectionId);
    
    if (newStatus === 'Rejected') {
        updateDocumentNonBlocking(connectionRef, { status: newStatus }, auth);
        return;
    }
    
    if (newStatus === 'Approved') {
        try {
            await runTransaction(firestore, async (transaction) => {
                const connDoc = await transaction.get(connectionRef);
                if (!connDoc.exists()) {
                    throw new Error("Connection request not found.");
                }
                
                const connectionData = connDoc.data() as Omit<Connection, 'id'>;

                // Update the connection status
                transaction.update(connectionRef, { status: newStatus });

                // Update both users' connected arrays
                const farmerRef = doc(firestore, 'users', connectionData.farmerUID);
                const dealerRef = doc(firestore, 'users', connectionData.dealerUID);

                transaction.update(farmerRef, { connectedDealers: arrayUnion(connectionData.dealerUID) });
                transaction.update(dealerRef, { connectedFarmers: arrayUnion(connectionData.farmerUID) });
            });
        } catch (e: any) {
            console.error("Error updating connection status: ", e);
            throw e; // Re-throw to be caught by the UI
        }
    }
}
