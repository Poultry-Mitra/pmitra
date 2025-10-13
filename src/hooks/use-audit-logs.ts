

// src/hooks/use-audit-logs.ts
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

export async function addAuditLog(firestore: Firestore, data: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: string }) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'audit_logs');
    
    const docData = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
    };

    try {
        await addDoc(collectionRef, docData);
    } catch (e: any) {
        console.error("Error creating audit log: ", e);
        // We don't want to show permission errors for audit log creation failures to the admin
        // but we should log them internally.
        const permissionError = new FirestorePermissionError({
            path: 'audit_logs',
            operation: 'create',
            requestResourceData: docData,
        });
        // We could emit this to a different channel or just log it
        console.error("Audit Log Permission Error:", permissionError);
    }
}
