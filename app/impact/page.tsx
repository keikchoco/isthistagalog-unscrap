'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Leaf, Zap, TrendingUp, CircleStar, PiggyBank, Recycle, Sprout, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { Scale } from 'lucide-react';

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
  const impactScore = profileData?.impactScore || 0;
  const totalXP = profileData?.totalXP || 0;
  const matterDiverted = profileData?.matterDiverted || 0;
  const rankOrder = ["Reducer", "Reuser", "Recycler", "Restorer", "Zero Waste"] as const;
  const rankThresholds = [0, 1000, 5000, 20000, 30000];
  let currentRankIndex = 0;
  for (let i = rankThresholds.length - 1; i >= 0; i--) {
    if (totalXP >= rankThresholds[i]) {
      currentRankIndex = i;
      break;
    }
  }
  const calculatedRank = rankOrder[currentRankIndex];
  const isMaxRank = currentRankIndex >= rankOrder.length - 1;
  const nextRankLabel = isMaxRank ? "Max Rank" : rankOrder[currentRankIndex + 1];
  
  // Progress to next rank (for the percentage text)
  const currentThreshold = rankThresholds[currentRankIndex];
  const nextThreshold = isMaxRank ? currentThreshold : rankThresholds[currentRankIndex + 1];
  const nextRankProgressPercent = isMaxRank
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100),
        ),
      );
  
  // Progress bar based on rank thresholds (0% at rank 0, 25% at rank 1, 50% at rank 2, 75% at rank 3, 100% at rank 4)
  const progressPercent = Math.round((currentRankIndex + nextRankProgressPercent / 100) * (100 / (rankOrder.length - 1)));

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout flex flex-col font-sans text-ink">
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full space-y-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {[
            { label: 'Scrap XP', val: totalXP.toLocaleString(), icon: CircleStar, color: 'text-moss', bg: 'bg-moss' },
            { label: 'Savings', val: `₱ ${impactScore.toLocaleString()}`, icon: PiggyBank, color: 'text-bark', bg: 'bg-moss' },
            { label: 'Scraps rescued', val: `${matterDiverted.toFixed(2)} kg`, icon: Recycle, color: 'text-moss', bg: 'bg-moss' },
            { label: 'Eco score', val: '0%', icon: Sprout, color: 'text-primary', bg: 'bg-moss' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-page-bg border border-bark/10 rounded-4xl p-8 flex items-center gap-6 shadow-lg"
            >
              <div className={`w-16 h-16 ${stat.bg} text-white rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-ink tracking-tight">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="relative overflow-hidden rounded-[36px] bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944] p-8 md:p-12 text-[#fdf6ec] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,246,236,0.08),transparent_34%)]" />
          <div className="relative grid gap-12 lg:grid-cols-[1.4fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.35em] text-[#efe4d2]/80">
                <Scale className="w-4 h-4" />
                UnScrap Rank
              </div>

              <div className="space-y-5">
                <h2 className="text-5xl md:text-7xl font-black tracking-wide leading-none">
                  {calculatedRank}
                </h2>
                <p className="max-w-2xl text-base md:text-lg leading-relaxed text-[#fdf6ec]/90">
                  You're just getting started. Scan your first scrap to earn ScrapXP and unlock the Reuser rank.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="h-3 rounded-full bg-[#fdf6ec]/20 overflow-visible">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-[#fdf6ec]"
                    />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-8 flex justify-between px-0 pointer-events-none">
                    {rankOrder.map((rank, index) => {
                      const diamondPosition = (index / (rankOrder.length - 1)) * 100;
                      return (
                        <div
                          key={rank}
                          className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 flex items-center justify-center"
                          style={{ left: `${diamondPosition}%` }}
                        >
                          {index <= currentRankIndex ? (
                            <Diamond className="size-8 fill-[#fdf6ec] text-[#fdf6ec]" />
                          ) : (
                            <Diamond className="size-8 text-[#fdf6ec]/30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute top-full w-full flex px-0 pointer-events-none mt-2">
                    {rankOrder.map((rank, index) => {
                      const labelPosition = (index / (rankOrder.length - 1)) * 100;
                      return (
                        <div
                          key={rank}
                          className="absolute -translate-x-1/2 text-center"
                          style={{ left: `${labelPosition}%` }}
                        >
                          <span
                            className={`text-[11px] md:text-sm font-medium whitespace-nowrap ${
                              index <= currentRankIndex ? "text-[#fdf6ec] font-bold" : "text-[#fdf6ec]/55"
                            }`}
                          >
                            {rank}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative flex h-64 w-64 md:h-80 md:w-80 items-center justify-center rounded-full border-[6px] border-dashed border-[#fdf6ec] text-center shadow-[0_0_0_14px_rgba(253,246,236,0.04)]">
                <div className="space-y-3 px-6">
                  <p className="text-5xl md:text-7xl font-black tracking-tight tabular-nums">
                    {nextRankProgressPercent}%
                  </p>
                  <p className="text-xl md:text-2xl font-bold leading-tight">
                    To the Next Rank
                  </p>
                  <p className="text-sm md:text-base font-medium text-[#fdf6ec]/80">
                    {nextRankLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}