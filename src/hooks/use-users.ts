
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
  addDoc,
  serverTimestamp,
  DocumentSnapshot,
  deleteDoc,
  limit,
  setDoc,
  type Auth,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

export function useUsers(role?: 'farmer' | 'dealer' | 'admin') {
  const firestore = useFirestore();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const usersCollection = collection(firestore, 'users');
    const q = query(usersCollection); // Fetch all users initially

    const unsubscribe = onSnapshot(
      q,
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
  }, [firestore]);

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

    useEffect(() => {
        if (!firestore || !userIds || userIds.length === 0) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Firestore 'in' queries are limited to 30 elements. If you have more, you need to batch requests.
        const q = query(collection(firestore, 'users'), where('__name__', 'in', userIds.slice(0, 30)));

        const unsubscribe = onSnapshot(
            q,
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
    }, [firestore, JSON.stringify(userIds)]); // stringify to prevent re-renders on array reference change

    return { users, loading };
}


export async function findUserByUniqueCode(firestore: Firestore, uniqueCode: string, role: UserRole): Promise<User | null> {
    if (!firestore) throw new Error("Firestore not initialized");

    const usersCollection = collection(firestore, 'users');
    const fieldToQuery = role === 'dealer' ? 'uniqueDealerCode' : 'id'; 
    
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


export async function createUserProfile(firestore: Firestore, auth: Auth, newUserProfile: Omit<User, 'id'>) {
    if (!firestore || !auth) {
        throw new Error("Firestore or Auth instance is not available.");
    }

    // A temporary, secure password for initial creation.
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, newUserProfile.email, tempPassword);
        const user = userCredential.user;

        // Create the user profile document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { ...newUserProfile, dateJoined: serverTimestamp() });

        // Send a password reset email so the user can set their own password
        await sendPasswordResetEmail(auth, newUserProfile.email);
        
        return userDocRef;
    } catch(e) {
        // This can fail if the email is already in use.
        console.error("Error creating auth user", e);
        throw e;
    }
}
