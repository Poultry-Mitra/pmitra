'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

let authInstance = null;

function initializeAuth() {
    if (typeof window === 'undefined') return null;
    if (authInstance) return authInstance;

    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    const app = getApp();
    authInstance = getFirebaseAuth(app);
    return authInstance;
}

export function getAuth() {
    return initializeAuth();
}
