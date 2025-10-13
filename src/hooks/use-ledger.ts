// src/hooks/use-ledger.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
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
  Transaction,
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

export function useLedger(userId?: string) {
  const firestore = useFirestore();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) { // Don't run if firestore is not available, or if no userId is provided for specific queries
        setEntries([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const ledgerCollection = collection(firestore, 'ledger');
    // If no userId, fetch all (for admin). If userId, filter by it.
    const q = userId 
        ? query(ledgerCollection, where("userId", "==", userId), orderBy("date", "desc"))
        : query(ledgerCollection, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEntries = snapshot.docs.map(toLedgerEntry);
        setEntries(fetchedEntries);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: `ledger ${userId ? `where userId == ${userId}`: ''}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching ledger entries:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, userId]);

  return { entries, loading };
}

export async function addLedgerEntry(
    firestore: Firestore, 
    userId: string, 
    data: Omit<LedgerEntry, 'id' | 'userId' | 'type' | 'balanceAfter'>,
    type: 'Debit' | 'Credit'
) {
    if (!firestore) throw new Error("Firestore not initialized");

    const ledgerCollection = collection(firestore, 'ledger');

    try {
        await runTransaction(firestore, async (transaction) => {
            const lastEntryQuery = query(
                ledgerCollection, 
                where("userId", "==", userId),
                orderBy("date", "desc"),
                limit(1)
            );
            
            // Note: In a transaction, you must use transaction.get() for reads.
            const lastEntryDocs = await transaction.get(lastEntryQuery);
            
            let lastBalance = 0;
            if (!lastEntryDocs.empty) {
                const lastEntry = lastEntryDocs.docs[0].data() as LedgerEntry;
                lastBalance = lastEntry.balanceAfter;
            }

            let newBalance = lastBalance;
            if (type === 'Credit') {
                newBalance += data.amount;
            } else {
                newBalance -= data.amount;
            }
            
            const newEntryRef = doc(ledgerCollection); // Create a new doc ref in the collection
            transaction.set(newEntryRef, {
                ...data,
                userId,
                type,
                balanceAfter: newBalance,
            });
        });
    } catch (e: any) {
        console.error("Ledger transaction failed: ", e);
        const permissionError = new FirestorePermissionError({
            path: 'ledger',
            operation: 'create',
            requestResourceData: { ...data, userId },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
    }
}


// Transaction-safe version of addLedgerEntry
export async function addLedgerEntryInTransaction(
    transaction: Transaction,
    firestore: Firestore,
    userId: string,
    data: Omit<LedgerEntry, 'id' | 'userId' | 'type' | 'balanceAfter'>,
    type: 'Debit' | 'Credit'
) {
    const ledgerCollection = collection(firestore, 'ledger');
    const lastEntryQuery = query(
        ledgerCollection,
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(1)
    );

    // We get the last entry using the transaction to ensure a consistent read.
    const lastEntryDocs = await transaction.get(lastEntryQuery);

    let lastBalance = 0;
    if (!lastEntryDocs.empty) {
        const lastEntry = lastEntryDocs.docs[0].data() as LedgerEntry;
        lastBalance = lastEntry.balanceAfter;
    }

    let newBalance = lastBalance;
    if (type === 'Credit') {
        newBalance += data.amount;
    } else {
        newBalance -= data.amount;
    }

    const newEntryRef = doc(ledgerCollection); // Create a new doc ref for the new entry.
    transaction.set(newEntryRef, {
        ...data,
        userId,
        type,
        balanceAfter: newBalance,
    });
}
