
// src/hooks/use-ledger.ts
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
  orderBy,
  runTransaction,
  doc,
  getDocs,
  limit,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { LedgerEntry } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to LedgerEntry type
function toLedgerEntry(doc: QueryDocumentSnapshot<DocumentData>): LedgerEntry {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: data.date,
    } as LedgerEntry;
}

export function useLedger(farmerUID: string) {
  const firestore = useFirestore();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !farmerUID) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const ledgerCollection = collection(firestore, 'ledger');
    const q = query(ledgerCollection, where("farmerUID", "==", farmerUID), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEntries = snapshot.docs.map(toLedgerEntry);
        // Balance calculation can be done on client for simplicity here
        let runningBalance = 0;
        const entriesWithBalance = [...fetchedEntries].reverse().map(entry => {
            if (entry.type === 'Credit') {
                runningBalance += entry.amount;
            } else {
                runningBalance -= entry.amount;
            }
            return { ...entry, balanceAfter: runningBalance };
        });
        setEntries(entriesWithBalance.reverse());
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `ledger where farmerUID == ${farmerUID}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching ledger entries:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, farmerUID]);

  return { entries, loading };
}

export async function addLedgerEntry(
    firestore: Firestore, 
    farmerUID: string, 
    data: Omit<LedgerEntry, 'id' | 'farmerUID' | 'type' | 'balanceAfter'>,
    type: 'Debit' | 'Credit'
) {
    if (!firestore) throw new Error("Firestore not initialized");

    const ledgerCollection = collection(firestore, 'ledger');

    try {
        await runTransaction(firestore, async (transaction) => {
            const lastEntryQuery = query(
                ledgerCollection, 
                where("farmerUID", "==", farmerUID),
                orderBy("date", "desc"),
                limit(1)
            );
            const lastEntrySnapshot = await getDocs(lastEntryQuery);
            const lastEntry = lastEntrySnapshot.docs[0]?.data() as LedgerEntry | undefined;
            const lastBalance = lastEntry?.balanceAfter || 0;

            let newBalance = lastBalance;
            if (type === 'Credit') {
                newBalance += data.amount;
            } else {
                newBalance -= data.amount;
            }
            
            const newEntryRef = doc(ledgerCollection); // Create a new doc ref in the collection
            transaction.set(newEntryRef, {
                ...data,
                farmerUID,
                type,
                balanceAfter: newBalance,
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        const permissionError = new FirestorePermissionError({
            path: 'ledger',
            operation: 'create',
            requestResourceData: { ...data, farmerUID },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e; // re-throw to be caught by the caller
    }
}
