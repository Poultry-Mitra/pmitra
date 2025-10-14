
'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
  Auth,
} from 'firebase/firestore';
import type { AuditLog } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from '@/firebase/provider';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export function addAuditLog(firestore: Firestore, auth: Auth, data: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: string }) {
    if (!firestore || !auth) throw new Error("Firestore or Auth not initialized");

    const collectionRef = collection(firestore, 'auditLogs');
    
    const docData = {
        ...data,
        timestamp: serverTimestamp(),
    };

    addDocumentNonBlocking(collectionRef, docData, auth);
}
