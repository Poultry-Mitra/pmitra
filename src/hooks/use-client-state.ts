
'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook to manage state that should only be initialized on the client.
 * This helps prevent hydration errors in Next.js by ensuring that the initial
 * server-rendered value is consistent with the initial client-rendered value.
 *
 * @param initialState - The initial state value. Can be a value or a function that returns a value.
 * @returns The stateful value that is only set on the client after mounting.
 *
 * @example
 * // In your component:
 * import { useClientState } from '@/hooks/use-client-state';
 *
 * const Component = () => {
 *   // `currentUser` might be undefined on the server, but will be set on the client.
 *   const user = useClientState(currentUser);
 *
 *   if (!user) {
 *     return <div>Loading user...</div>; // Or a skeleton loader
 *   }
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 */
export function useClientState<T>(initialState: T | (() => T)): T {
  const [state, setState] = useState<T>(
    () => (typeof window === 'undefined' ? (null as T) : initialState)
  );

  useEffect(() => {
    // Set the actual initial state on the client after the component mounts.
    // This runs only on the client.
    setState(initialState);
  }, [initialState]);

  return state;
}
