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

export function usePosts(isAdmin: boolean = false) {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const postsCollection = collection(firestore, 'posts');
    // Correctly apply query based on isAdmin flag
    if (isAdmin) {
      return query(postsCollection, orderBy("createdAt", "desc"));
    } else {
      return query(postsCollection, where("isPublished", "==", true), orderBy("createdAt", "desc"));
    }
  }, [firestore, isAdmin]);


  useEffect(() => {
    if (!postsQuery) {
        setPosts([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map(toPost));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setPosts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postsQuery]);

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
