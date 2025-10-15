// src/app/(app)/biosecurity/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BiosecurityRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(app)/biosecurity');
  }, [router]);
  return null;
}
