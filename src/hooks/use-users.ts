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
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to convert Firestore doc to User type
function toUser(doc: QueryDocumentSnapshot<DocumentData>): User {
    const data = doc.data();
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
        setUsers(snapshot.docs.map(toUser));
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
        const usersCollection = collection(firestore, 'users');
        const q = query(usersCollection, where('__name__', 'in', userIds.slice(0, 30)));

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
    }, [firestore, JSON.stringify(userIds)]); // stringify to prevent re-renders

    return { users, loading };
}


export async function findUserByDealerCode(firestore: Firestore, dealerCode: string): Promise<User | null> {
    if (!firestore) throw new Error("Firestore not initialized");

    const usersCollection = collection(firestore, 'users');
    const q = query(usersCollection, where("uniqueDealerCode", "==", dealerCode), where("role", "==", "dealer"));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        return toUser(querySnapshot.docs[0]);
    } catch (error) {
        console.error("Error finding user by dealer code:", error);
        throw error;
    }
}
