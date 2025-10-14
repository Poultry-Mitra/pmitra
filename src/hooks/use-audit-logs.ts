
'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { AuditLog } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from '@/firebase/provider';

export async function addAuditLog(firestore: Firestore, data: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: string }) {
    const auth = useAuth();
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'auditLogs');
    
    const docData = {
        ...data,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collectionRef, docData);
    } catch (e: any) {
        console.error("Error creating audit log: ", e);
        // We don't want to show permission errors for audit log creation failures to the admin
        // but we should log them internally.
        const permissionError = new FirestorePermissionError({
            path: 'auditLogs',
            operation: 'create',
            requestResourceData: docData,
        }, auth);
        // We could emit this to a different channel or just log it
        console.error("Audit Log Permission Error:", permissionError);
    }
}
