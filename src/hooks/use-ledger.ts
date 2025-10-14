// src/hooks/use-ledger.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  doc,
  limit,
  Transaction,
} from 'firebase/firestore';
import type { LedgerEntry } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';
import { useMemoFirebase } from '@/firebase/provider';

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

  const ledgerQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
        collection(firestore, 'ledger'), 
        where("userId", "==", userId), 
        orderBy("date", "desc")
    );
  }, [firestore, userId]);


  useEffect(() => {
    if (!ledgerQuery) {
        setEntries([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      ledgerQuery,
      (snapshot) => {
        const fetchedEntries = snapshot.docs.map(toLedgerEntry);
        setEntries(fetchedEntries);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching ledger entries:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ledgerQuery]);

  return { entries, loading };
}

export async function addLedgerEntry(
    firestore: Firestore, 
    userId: string, 
    data: Omit<LedgerEntry, 'id' | 'userId' | 'type' | 'balanceAfter'>,
    type: 'Debit' | 'Credit'
) {
    if (!firestore) throw new Error("Firestore not initialized");

    try {
        await runTransaction(firestore, async (transaction) => {
            await addLedgerEntryInTransaction(transaction, firestore, userId, data, type);
        });
    } catch (e: any) {
        console.error("Ledger transaction failed: ", e);
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
    
    const newEntryRef = doc(ledgerCollection);
    
    transaction.set(newEntryRef, newEntryData);
}
