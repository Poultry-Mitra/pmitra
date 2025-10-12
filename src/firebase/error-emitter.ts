// src/firebase/error-emitter.ts
import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// This is a simple event emitter to help us bubble up errors to the UI.
// This is not a full-fledged error reporting service.
// For production, you should use a service like Sentry or Bugsnag.
class FirebaseErrorEmitter extends EventEmitter {
  constructor() {
    super();
    // This is to avoid a memory leak warning.
    this.setMaxListeners(100);
  }

  emit<T extends keyof Events>(event: T, ...args: Parameters<Events[T]>) {
    return super.emit(event, ...args);
  }

  on<T extends keyof Events>(event: T, listener: Events[T]) {
    return super.on(event, listener);
  }
}

export const errorEmitter = new FirebaseErrorEmitter();
