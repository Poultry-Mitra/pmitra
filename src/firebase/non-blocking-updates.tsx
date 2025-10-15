
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  Auth,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Now awaits the write operation internally to prevent data loss.
 */
export async function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions, auth: Auth | null) {
  try {
    await setDoc(docRef, data, options);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: options && 'merge' in options ? 'update' : 'create',
        requestResourceData: data,
      }, auth)
    );
    throw error;
  }
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Awaits the write operation internally to prevent data loss.
 */
export async function addDocumentNonBlocking(colRef: CollectionReference, data: any, auth: Auth | null) {
  try {
    await addDoc(colRef, data);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      }, auth)
    )
    // Re-throw the original error if you want callers to be able to handle it too
    throw error;
  }
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Now awaits the write operation internally to prevent data loss.
 */
export async function updateDocumentNonBlocking(docRef: DocumentReference, data: any, auth: Auth | null) {
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      }, auth)
    );
    throw error;
  }
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Now awaits the write operation internally to prevent data loss.
 */
export async function deleteDocumentNonBlocking(docRef: DocumentReference, auth: Auth | null) {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }, auth)
    );
    throw error;
  }
}
