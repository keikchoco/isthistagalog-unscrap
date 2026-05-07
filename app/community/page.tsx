'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { authClient } from '@/lib/auth-client';

const CommunityMap = dynamic(() => import('@/components/CommunityMap'), {
  ssr: false,
  loading: () => <div className="w-full h-100 bg-sprout/10 animate-pulse rounded-[48px] border-2 border-moss" />,
});

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;

  useEffect(() => {
    setUser(sessionUser ? { email: sessionUser.email, displayName: sessionUser.name } : null);
  }, [sessionUser?.email, sessionUser?.name]);

  return (
    <div className="min-h-screen bg-white selection:bg-sprout flex flex-col font-sans text-ink">
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full flex flex-col gap-8 min-h-fit">
        <CommunityMap user={user} />
      </main>
    </div>
  );
}