

// src/hooks/use-users.ts
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
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  serverTimestamp,
  DocumentSnapshot,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User, UserRole } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to User type
function toUser(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): User {
    const data = doc.data();
    if (!data) throw new Error("User document data is empty");
    return {
        id: doc.id,
        ...data,
        dateJoined: data.dateJoined,
    } as User;
}

export function useUsers(role?: 'farmer' | 'dealer') {
  const firestore = useFirestore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
        setUsers([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const usersCollection = collection(firestore, 'users');
    const q = role ? query(usersCollection, where("role", "==", role)) : query(usersCollection);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUsers(snapshot.docs.map(d => toUser(d)));
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'users',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, role]);

  return { users, loading };
}

export function useUsersByIds(userIds: string[]) {
    const firestore = useFirestore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !userIds || userIds.length === 0) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Firestore 'in' queries are limited to 30 elements
        const q = query(collection(firestore, 'users'), where('__name__', 'in', userIds.slice(0, 30)));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                setUsers(snapshot.docs.map(toUser));
                setLoading(false);
            },
            (err) => {
                 const permissionError = new FirestorePermissionError({
                    path: 'users',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
                console.error("Error fetching users by IDs:", err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, JSON.stringify(userIds)]); // stringify to prevent re-renders on array reference change

    return { users, loading };
}


export async function findUserByUniqueCode(firestore: Firestore, uniqueCode: string, role: UserRole): Promise<User | null> {
    if (!firestore) throw new Error("Firestore not initialized");

    const usersCollection = collection(firestore, 'users');
    const fieldToQuery = role === 'dealer' ? 'uniqueDealerCode' : 'id'; // Placeholder for farmer
    
    // This is inefficient for farmers, but works for dealers.
    // A better approach for farmers would be a dedicated searchable field or a more direct lookup.
    const q = query(usersCollection, where(fieldToQuery, "==", uniqueCode), where("role", "==", role), limit(1));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        return toUser(querySnapshot.docs[0]);
    } catch (error) {
        console.error("Error finding user by unique code:", error);
        throw error;
    }
}


export async function requestDealerConnection(firestore: Firestore, farmerUID: string, dealerCode: string): Promise<User> {
    if (!firestore) throw new Error("Firestore not initialized");

    const dealerUser = await findUserByUniqueCode(firestore, dealerCode, 'dealer');
    if (!dealerUser) {
        throw new Error("Dealer not found with that code.");
    }
    
    const dealerIsPremium = dealerUser.planType === 'premium';
    const farmerLimit = 2;
    if (!dealerIsPremium && (dealerUser.connectedFarmers || []).length >= farmerLimit) {
        throw new Error("This dealer has reached the maximum number of connected farmers on their current plan.");
    }

    const connectionsCollection = collection(firestore, 'connections');
    await addDoc(connectionsCollection, {
        farmerUID,
        dealerUID: dealerUser.id,
        status: 'Pending',
        requestedBy: 'farmer',
        createdAt: serverTimestamp(),
    }).catch(e => {
        const permissionError = new FirestorePermissionError({
            path: 'connections',
            operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
    });
    
    return dealerUser;
}

export function deleteUser(firestore: Firestore, userId: string) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);

    return deleteDoc(docRef).catch((e) => {
        const permissionError = new FirestorePermissionError({
            path: `users/${userId}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
    });
}


export async function createUserProfile(firestore: Firestore, newUserProfile: Omit<User, 'id'>) {
    if (!firestore) {
        throw new Error("Firestore instance is not available.");
    }

    const usersCollection = collection(firestore, "users");

    try {
        const docRef = await addDoc(usersCollection, newUserProfile);
        return docRef;
    } catch (error) {
        // Emit a specific permission error for better debugging
        const permissionError = new FirestorePermissionError({
            path: 'users',
            operation: 'create',
            requestResourceData: newUserProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the original error to be caught by the calling function's try/catch block
        throw error;
    }
}
