// src/hooks/use-users.ts
'use client';

import { useState, useEffect, useContext } from 'react';
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
import { useFirestore, useAuth, AuthContext } from '@/firebase/provider';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getAllUsers } from '@/ai/flows/get-all-users';

// Helper to convert Firestore doc to User type, sanitizing the data
function toUser(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData> | any, isFromFlow: boolean = false): User {
    const data = isFromFlow ? doc : doc.data();
    if (!data) throw new Error("User document data is empty");
    
    return {
        id: isFromFlow ? data.id : doc.id,
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


// This hook now uses a Genkit flow to fetch all users for the admin, bypassing security rules.
export function useUsers() {
  const { user: adminUser } = useContext(AuthContext)!;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
        if (!adminUser || adminUser.email !== 'ipoultrymitra@gmail.com') {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await getAllUsers({ adminUid: adminUser.uid });
            if (result && result.users) {
                 const mappedUsers = result.users.map(u => toUser(u, true));
                 // Sort client-side
                 mappedUsers.sort((a, b) => new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime());
                 setUsers(mappedUsers);
            }
        } catch (err) {
            console.error("Error fetching users via Genkit flow:", err);
            setUsers([]); // Set to empty array on error
        } finally {
            setLoading(false);
        }
    }

    fetchUsers();
  }, [adminUser]);
  
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
          const fetchedUsers = userSnapshots.flatMap(snapshot => snapshot.docs.map(doc => toUser(doc)));
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
