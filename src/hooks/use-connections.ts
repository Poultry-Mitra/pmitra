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
import { useMemoFirebase } from '@/firebase/provider';

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

  const connectionsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    const connectionsCollection = collection(firestore, 'connections');
    const field = userRole === 'farmer' ? 'farmerUID' : 'dealerUID';
    return query(
        connectionsCollection, 
        where(field, "==", userId)
        // Removed orderBy("createdAt") which would require a composite index
        // Sorting can be done on the client if needed.
    );
  }, [firestore, userId, userRole]);


  useEffect(() => {
    if (!connectionsQuery) {
        setConnections([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      connectionsQuery,
      (snapshot) => {
        // Sort client-side
        const sortedConnections = snapshot.docs.map(toConnection).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setConnections(sortedConnections);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching connections:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [connectionsQuery]);

  return { connections, loading };
}

export async function updateConnectionStatus(firestore: Firestore, connectionId: string, newStatus: 'Approved' | 'Rejected') {
    if (!firestore) throw new Error("Firestore not initialized");

    const connectionRef = doc(firestore, 'connections', connectionId);
    
    if (newStatus === 'Rejected') {
        // Here auth can be null because security rules for update might be based on resource data
        updateDocumentNonBlocking(connectionRef, { status: newStatus }, null);
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
