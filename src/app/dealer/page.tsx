
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";

export default function DealerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dealer/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting to dealer dashboard...</p>
    </div>
  );
}
