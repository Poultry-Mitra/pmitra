
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
  serverTimestamp,
  DocumentSnapshot,
  limit,
  type Auth,
} from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Helper to convert Firestore doc to User type, sanitizing the data
function toUser(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): User {
    const data = doc.data();
    if (!data) throw new Error("User document data is empty");
    
    // Return a sanitized user object, excluding potentially sensitive fields
    return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        dateJoined: data.dateJoined,
        planType: data.planType,
        uniqueDealerCode: data.uniqueDealerCode, // This can be public
        poultryMitraId: data.poultryMitraId,
        mobileNumber: data.mobileNumber,
        state: data.state,
        district: data.district,
        pinCode: data.pinCode,
        connectedFarmers: data.connectedFarmers,
        // Explicitly DO NOT include connectedDealers here for general purpose user fetching
    } as User;
}

export function useUsers(role?: 'farmer' | 'dealer' | 'admin') {
  const firestore = useFirestore();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);


  useEffect(() => {
    if (!usersQuery) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setAllUsers(snapshot.docs.map(d => toUser(d)));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usersQuery]);

  const users = role ? allUsers.filter(user => user.role === role) : allUsers;
  
  const handleUserDeletion = (userId: string) => {
      setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };


  return { users, loading, handleUserDeletion };
}


export function useUsersByIds(userIds: string[]) {
    const firestore = useFirestore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const usersByIdsQuery = useMemoFirebase(() => {
      if (!firestore || !userIds || userIds.length === 0) return null;
      // Firestore 'in' queries are limited to 30 elements.
      return query(collection(firestore, 'users'), where('__name__', 'in', userIds.slice(0, 30)));
    }, [firestore, userIds]);


    useEffect(() => {
        if (!usersByIdsQuery) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(
            usersByIdsQuery,
            (snapshot) => {
                setUsers(snapshot.docs.map(toUser));
                setLoading(false);
            },
            (err) => {
                 console.error("Error fetching users by IDs:", err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [usersByIdsQuery]);

    return { users, loading };
}


export async function findUserByUniqueCode(firestore: Firestore, uniqueCode: string, role: UserRole): Promise<User | null> {
    if (!firestore) throw new Error("Firestore not initialized");

    const usersCollection = collection(firestore, 'users');
    const fieldToQuery = role === 'dealer' ? 'uniqueDealerCode' : 'poultryMitraId'; 
    
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


export function requestDealerConnection(firestore: Firestore, farmerUID: string, dealerCode: string): Promise<User> {
    if (!firestore) throw new Error("Firestore not initialized");

    return new Promise(async (resolve, reject) => {
        try {
            const dealerUser = await findUserByUniqueCode(firestore, dealerCode, 'dealer');
            if (!dealerUser) {
                return reject(new Error("Dealer not found with that code."));
            }
            
            const dealerIsPremium = dealerUser.planType === 'premium';
            const farmerLimit = 2;
            if (!dealerIsPremium && (dealerUser.connectedFarmers || []).length >= farmerLimit) {
                return reject(new Error("This dealer has reached the maximum number of connected farmers on their current plan."));
            }

            const connectionsCollection = collection(firestore, 'connections');
            // Auth is passed as null because the security rules for creating a connection
            // are based on the UIDs in the data, not the logged-in user.
            addDocumentNonBlocking(connectionsCollection, {
                farmerUID,
                dealerUID: dealerUser.id,
                status: 'Pending',
                requestedBy: 'farmer',
                createdAt: serverTimestamp(),
            }, null);
            
            resolve(dealerUser);
        } catch (error) {
            reject(error);
        }
    });
}


export function deleteUser(firestore: Firestore, auth: Auth | null, userId: string) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);
    // In a real app, you would also need to delete the user from Firebase Auth,
    // which requires admin privileges and should be done via a Cloud Function.
    deleteDocumentNonBlocking(docRef, auth);
}

export function updateUserStatus(firestore: Firestore, auth: Auth | null, userId: string, status: UserStatus) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(docRef, { status }, auth);
}

export function updateUserPlan(firestore: Firestore, auth: Auth | null, userId: string, planType: 'free' | 'premium') {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(docRef, { planType }, auth);
}

    