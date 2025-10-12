// src/components/firebase-error-listener.tsx
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This component listens for Firestore permission errors and throws them
// so that they can be caught by Next.js's error overlay.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handler = (error: Error) => {
      // Throw the error to trigger the Next.js error overlay
      // This is only for development and should be handled differently in production.
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          throw error;
        }, 0);
      } else {
        // In production, you might want to log the error to a service
        console.error('Firestore Permission Error:', error);
      }
    };

    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.off('permission-error', handler);
    };
  }, []);

  return null;
}
