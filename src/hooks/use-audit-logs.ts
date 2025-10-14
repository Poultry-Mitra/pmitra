
'use client';

import {
  collection,
  serverTimestamp,
  type Firestore,
  Auth,
} from 'firebase/firestore';
import type { AuditLog } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export function addAuditLog(firestore: Firestore, auth: Auth, data: Omit<AuditLog, 'id' | 'timestamp'>) {
    if (!firestore || !auth) throw new Error("Firestore or Auth not initialized");

    const collectionRef = collection(firestore, 'auditLogs');
    
    const docData = {
        ...data,
        timestamp: serverTimestamp(),
    };

    addDocumentNonBlocking(collectionRef, docData, auth);
}
