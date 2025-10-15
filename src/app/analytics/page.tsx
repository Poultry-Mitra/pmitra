// src/app/analytics/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/analytics');
  }, [router]);
  return null;
}
