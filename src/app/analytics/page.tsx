// src/app/(app)/analytics/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(app)/analytics');
  }, [router]);
  return null;
}
