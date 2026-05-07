'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Leaf, Zap } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function ImpactPage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;

  useEffect(() => {
    const loadProfile = async () => {
      if (!sessionUser?.email) {
        setUser(null);
        setProfileData(null);
        return;
      }

      setUser({ email: sessionUser.email, displayName: sessionUser.name });

      const res = await fetch(`/api/user?email=${sessionUser.email}&name=${encodeURIComponent(sessionUser.name || sessionUser.email.split('@')[0])}`);
      const data = await res.json();
      setProfileData(data);
    };

    loadProfile();
  }, [sessionUser?.email, sessionUser?.name]);

  const userRank = profileData?.rank || 'Reducer';
  const totalSaved = profileData?.matterDiverted || 0;
  const impactScore = profileData?.impactScore || 0;

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout flex flex-col font-sans text-ink">
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full space-y-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Waste Diverted', val: `${totalSaved.toFixed(2)}kg`, icon: Leaf, color: 'text-moss', bg: 'bg-sprout/30' },
            { label: 'Impact Score', val: `₱${impactScore.toLocaleString()}`, icon: DollarSign, color: 'text-bark', bg: 'bg-sprout/20' },
            { label: 'XP Earned', val: (profileData?.totalXP || 0).toLocaleString(), icon: Zap, color: 'text-primary', bg: 'bg-sprout' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-8 flex flex-col items-center text-center gap-4">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-ink tracking-tight">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-10 bg-gradient-to-br from-primary to-bark text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight">The {userRank} Progress</h1>
              <p className="max-w-md opacity-80 font-medium">
                You've reached the status of <span className="underline decoration-white/50">{userRank}</span>. Collect more XP to unlock the secrets of the Zero Waste rank.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}