

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
import { useFirestore, useUser } from '@/firebase/provider';
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
  const { user: authUser } = useUser();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If firestore is not available, or if there's no specific userId and no authenticated user (for admin case), do nothing.
    if (!firestore || (!userId && !authUser)) {
        setEntries([]);
        setLoading(false);
        return;
    }

    if (userId === undefined) { 
      console.warn("useLedger called without a userId. Fetching all entries, which may have performance implications.");
    }
    
    setLoading(true);
    const ledgerCollection = collection(firestore, 'ledger');
    
    const q = userId 
        ? query(ledgerCollection, where("userId", "==", userId), orderBy("date", "desc"))
        : query(ledgerCollection, orderBy("date", "desc")); // This query is for admin

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
  }, [firestore, userId, authUser]);

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
            await addLedgerEntryInTransaction(transaction, firestore, userId, data, type);
        });
    } catch (e: any) {
        console.error("Ledger transaction failed: ", e);
        // Re-throw the original error to be handled by the caller.
        // The permission error would have been emitted inside addLedgerEntryInTransaction if it was a permission issue.
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

    const newEntryData = {
        ...data,
        userId,
        type,
        balanceAfter: newBalance,
    };
    
    const newEntryRef = doc(ledgerCollection); // Create a new doc ref for the new entry.
    try {
        transaction.set(newEntryRef, newEntryData);
    } catch(e) {
        const permissionError = new FirestorePermissionError({
            path: `ledger/${newEntryRef.id}`,
            operation: 'create',
            requestResourceData: newEntryData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}
