
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
  FirestoreError,
  orderBy,
} from 'firebase/firestore';
import { useFirestore, useAuth } from '@/firebase/provider';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAppUser } from '@/app/app-provider';

// Helper to convert Firestore doc to User type, sanitizing the data
function toUser(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): User {
    const data = doc.data();
    if (!data) throw new Error("User document data is empty");
    
    return {
        id: doc.id,
        name: data.name || "Unnamed User",
        email: data.email || "",
        role: data.role || "farmer",
        status: data.status || "Pending",
        dateJoined: data.dateJoined || new Date().toISOString(),
        planType: data.planType || "free",
        uniqueDealerCode: data.uniqueDealerCode,
        poultryMitraId: data.poultryMitraId,
        mobileNumber: data.mobileNumber,
        state: data.state,
        district: data.district,
        pinCode: data.pinCode,
        biosecurityMeasures: data.biosecurityMeasures,
        connectedFarmers: data.connectedFarmers || [],
        connectedDealers: data.connectedDealers || [],
        aiQueriesCount: data.aiQueriesCount || 0,
        lastQueryDate: data.lastQueryDate,
    } as User;
}

export function useUsers(role?: 'farmer' | 'dealer' | 'admin') {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: appUser, loading: appUserLoading } = useAppUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (appUserLoading || !firestore || !appUser) {
        setLoading(true);
        return;
    }
    
    setLoading(true);
    let usersQuery;
    const baseQuery = collection(firestore, 'users');

    // DECISIVE CHANGE: If the user is an admin, to prevent the `list` permission error,
    // we will now only fetch THEIR OWN user document. This avoids listing all users on the dashboard.
    // The main user management pages will handle their own, more specific queries.
    if (appUser.role === 'admin' && !role) {
      const userDocRef = doc(firestore, 'users', appUser.id);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUsers([toUser(docSnap)]);
        } else {
          setUsers([]);
        }
        setLoading(false);
      }, (err: FirestoreError) => {
        console.error("Error fetching single admin user:", err);
        setUsers([]);
        setLoading(false);
      });
      return () => unsubscribe();
    }
    
    // Original logic for specific role pages (farmers, dealers) remains.
    if (role) {
      usersQuery = query(baseQuery, where("role", "==", role));
    } else {
       // This will now primarily run for non-admin users or when no role is specified.
       // For safety, we limit it.
      usersQuery = query(baseQuery, orderBy("dateJoined", "desc"), limit(100));
    }
    
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setUsers(snapshot.docs.map(toUser));
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Error in useUsers hook:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, role, auth, appUser, appUserLoading]);

  const handleUserDeletion = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  return { users, loading, handleUserDeletion };
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
      const chunks: string[][] = [];
      for (let i = 0; i < userIds.length; i += 30) {
          chunks.push(userIds.slice(i, i + 30));
      }

      const fetchUsers = async () => {
        try {
          const userPromises = chunks.map(chunk => 
            getDocs(query(collection(firestore, 'users'), where('__name__', 'in', chunk)))
          );
          const userSnapshots = await Promise.all(userPromises);
          const fetchedUsers = userSnapshots.flatMap(snapshot => snapshot.docs.map(toUser));
          setUsers(fetchedUsers);
        } catch (err) {
          console.error("Error fetching users by IDs:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
      
    }, [firestore, JSON.stringify(userIds)]);

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


export async function requestDealerConnection(firestore: Firestore, farmerUID: string, dealerCode: string): Promise<User> {
    if (!firestore) throw new Error("Firestore not initialized");

    const connectionsCollection = collection(firestore, 'connections');
    const dealerUser = await findUserByUniqueCode(firestore, dealerCode, 'dealer');
    if (!dealerUser) {
        throw new Error("Dealer not found with that code.");
    }
    
    const existingConnectionQuery = query(
        connectionsCollection,
        where("farmerUID", "==", farmerUID),
        where("dealerUID", "==", dealerUser.id)
    );

    const existingConnectionSnapshot = await getDocs(existingConnectionQuery);
    if (!existingConnectionSnapshot.empty) {
        const existingStatus = existingConnectionSnapshot.docs[0].data().status;
        if (existingStatus === 'Approved') {
            throw new Error(`You are already connected with ${dealerUser.name}.`);
        }
        if (existingStatus === 'Pending') {
            throw new Error(`A connection request to ${dealerUser.name} is already pending.`);
        }
    }
    
    const dealerIsPremium = dealerUser.planType === 'premium';
    const farmerLimit = 2; 
    if (!dealerIsPremium && (dealerUser.connectedFarmers || []).length >= farmerLimit) {
        throw new Error("This dealer has reached the maximum number of connected farmers on their current plan.");
    }

    await addDocumentNonBlocking(connectionsCollection, {
        farmerUID,
        dealerUID: dealerUser.id,
        status: 'Pending',
        requestedBy: 'farmer',
        createdAt: serverTimestamp(),
    }, null); 
    
    return dealerUser;
}



export async function deleteUser(firestore: Firestore, auth: Auth | null, userId: string) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);
    await deleteDocumentNonBlocking(docRef, auth);
}

export async function updateUserStatus(firestore: Firestore, auth: Auth | null, userId: string, status: UserStatus) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);
    await updateDocumentNonBlocking(docRef, { status }, auth);
}

export async function updateUserPlan(firestore: Firestore, auth: Auth | null, userId: string, planType: 'free' | 'premium') {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'users', userId);
    await updateDocumentNonBlocking(docRef, { planType }, auth);
}
