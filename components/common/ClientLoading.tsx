'use client';

import { useEffect, useState } from 'react';

export default function ClientLoading({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-black">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return <div suppressHydrationWarning>{children}</div>;
}