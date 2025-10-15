// src/app/(app)/diagnose-health/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DiagnoseHealthRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(app)/diagnose-health');
  }, [router]);
  return null;
}
