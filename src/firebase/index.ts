'use client';

// This barrel file re-exports for easy consumption.
// The actual client-side initialization is now handled in client.ts.

export * from '@/firebase/client'; // Exporting the new client-side initializer
export * from '@/firebase/provider';
export * from '@/firebase/client-provider';
export * from '@/firebase/firestore/use-collection';
export * from '@/firebase/firestore/use-doc';
export * from '@/firebase/errors';
export * from '@/firebase/error-emitter';
