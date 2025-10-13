'use client';

// This barrel file re-exports for easy consumption.
// The actual client-side initialization is now handled in client.ts.

export * from './client'; // Exporting the new client-side initializer
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
