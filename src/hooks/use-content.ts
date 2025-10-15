// src/hooks/use-content.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  serverTimestamp,
  type Firestore,
  type DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  limit,
  getDocs,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Post, DailyRates } from '@/lib/types';
import { useMemoFirebase } from '@/firebase';

// Helper to convert Firestore doc to Post type
function toPost(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Post {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        featuredImageUrl: data.featuredImageUrl,
        tags: data.tags,
        isPublished: data.isPublished,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Post;
}

// Helper to convert Firestore doc to DailyRates type
function toDailyRate(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): DailyRates {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate().toISOString() : data.lastUpdated,
    } as DailyRates;
}

export function usePosts() {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
        setPosts([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const postsCollection = collection(firestore, 'posts');
    const q = query(postsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(snapshot.docs.map(toPost));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  return { posts, loading };
}

export function usePost(postId: string | null) {
    const firestore = useFirestore();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !postId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(firestore, 'posts', postId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setPost(toPost(doc));
            } else {
                setPost(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, postId]);

    return { post, loading };
}


export function usePostBySlug(slug: string) {
    const firestore = useFirestore();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const postsCollection = collection(firestore, 'posts');
        const q = query(postsCollection, where("slug", "==", slug), where("isPublished", "==", true), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setPost(toPost(snapshot.docs[0]));
            } else {
                setPost(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();

    }, [firestore, slug]);
    
    return { post, loading };
}


export async function addPost(firestore: Firestore, data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'posts');
    
    const postData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await addDoc(collectionRef, postData);
}

export async function updatePost(firestore: Firestore, postId: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) {
    if (!firestore) throw new Error("Firestore not initialized");

    const docRef = doc(firestore, 'posts', postId);
    
    const postData = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, postData);
}

export async function deletePost(firestore: Firestore, postId: string) {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'posts', postId);
    await deleteDoc(docRef);
}


// New hook for fetching daily rates history safely
export function useDailyRatesHistory() {
  const firestore = useFirestore();
  const [rates, setRates] = useState<DailyRates[]>([]);
  const [loading, setLoading] = useState(true);

  const ratesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'dailyRates'), orderBy('lastUpdated', 'desc'), limit(30));
  }, [firestore]);

  useEffect(() => {
    if (!ratesQuery) {
        setRates([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    // Use getDocs for a one-time fetch which is sufficient for history and safer with rules
    getDocs(ratesQuery)
      .then((snapshot) => {
        const fetchedRates = snapshot.docs.map(toDailyRate);
        setRates(fetchedRates);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching daily rates history:", err);
        setRates([]);
        setLoading(false);
      });
  }, [ratesQuery]);

  return { rates, loading };
}
