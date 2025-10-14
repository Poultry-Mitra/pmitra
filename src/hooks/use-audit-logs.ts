
'use client';

import {
  collection,
  serverTimestamp,
  type Firestore,
  Auth,
} from 'firebase/firestore';
import type { AuditLog } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export function addAuditLog(firestore: Firestore, data: Omit<AuditLog, 'id' | 'timestamp'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'auditLogs');
    
    const docData = {
        ...data,
        timestamp: new Date().toISOString(),
    };

    // Auth is passed as null because this is an admin-only action,
    // and security rules grant write access based on the isAdmin() check.
    addDocumentNonBlocking(collectionRef, docData, null);
}
