'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { authClient } from '@/lib/auth-client';
import { MapPin, Users, Leaf } from 'lucide-react';

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
    <div className="min-h-screen bg-transparent selection:bg-sprout flex flex-col font-sans text-ink">
      <main className="pt-24 sm:pt-28 pb-12 px-4 sm:px-6 max-w-7xl mx-auto flex-1 w-full flex flex-col gap-6 sm:gap-8 min-h-fit">
        <section className="rounded-3xl border border-bark/10 bg-page-bg p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-moss mb-3">
            <MapPin className="w-4 h-4" /> Community Map
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Find Nearby Scrap Hubs</h1>
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-3xl">
            This page helps people share local drop-off spots, exchange points, and community resource hubs. Search existing pins,
            get directions, and if you are signed in, place one hub point to help others in your area.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
            <span className="inline-flex items-center gap-1 rounded-full bg-sprout/20 px-3 py-1 text-moss"><Users className="w-3.5 h-3.5" /> Community Shared</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sprout/20 px-3 py-1 text-moss"><Leaf className="w-3.5 h-3.5" /> Sustainability Focused</span>
          </div>
        </section>

        <CommunityMap user={user} />
      </main>
    </div>
  );
}