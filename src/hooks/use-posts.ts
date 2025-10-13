
// src/hooks/use-posts.ts
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
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Post } from '@/lib/types';
import slugify from "slugify";
import { samplePosts } from '@/lib/blog-posts'; // Import sample posts

const USE_LOCAL_DATA = true; // Set to true to use local data, false for Firestore

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
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    } as Post;
}

export function usePosts() {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_LOCAL_DATA) {
        setPosts(samplePosts);
        setLoading(false);
        return;
    }

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
        if (USE_LOCAL_DATA) {
            const foundPost = samplePosts.find(p => p.id === postId);
            setPost(foundPost || null);
            setLoading(false);
            return;
        }

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
        if (USE_LOCAL_DATA) {
            const foundPost = samplePosts.find(p => p.slug === slug);
            setPost(foundPost || null);
            setLoading(false);
            return;
        }

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
    if (USE_LOCAL_DATA) {
        console.log("Local data mode: Pretending to add post", data);
        return;
    }
    if (!firestore) throw new Error("Firestore not initialized");

    const collectionRef = collection(firestore, 'posts');
    
    const postData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await addDoc(collectionRef, postData);
}

export async function updatePost(firestore: Firestore, postId: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) {
    if (USE_LOCAL_DATA) {
        console.log("Local data mode: Pretending to update post", postId, data);
        return;
    }
    if (!firestore) throw new Error("Firestore not initialized");

    const docRef = doc(firestore, 'posts', postId);
    
    const postData = {
        ...data,
        updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, postData);
}

export async function deletePost(firestore: Firestore, postId: string) {
     if (USE_LOCAL_DATA) {
        console.log("Local data mode: Pretending to delete post", postId);
        return;
    }
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'posts', postId);
    await deleteDoc(docRef);
}
