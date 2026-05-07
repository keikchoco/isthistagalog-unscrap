"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  DollarSign,
  Leaf,
  Package,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { authClient } from '@/lib/auth-client';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;

  useEffect(() => {
    const loadUserData = async () => {
      if (!sessionUser?.email) {
        setUser(null);
        setProfileData(null);
        setScanHistory([]);
        return;
      }

      setUser({ email: sessionUser.email, displayName: sessionUser.name });

      const res = await fetch(`/api/user?email=${sessionUser.email}&name=${encodeURIComponent(sessionUser.name || sessionUser.email.split('@')[0])}`);
      const data = await res.json();
      setProfileData(data);

      const historyRes = await fetch(`/api/scans?userId=${sessionUser.email}`);
      const historyData = await historyRes.json();
      if (Array.isArray(historyData)) {
        setScanHistory(historyData);
      }
    };

    loadUserData();
  }, [sessionUser?.email, sessionUser?.name]);

  const userRank = profileData?.rank || "Reducer";
  const impactScore = profileData?.impactScore || 0;

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout flex flex-col font-sans text-ink">
      <section className="mt-24 bg-surface border border-bark/10 p-12 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
        <div className="grow max-w-7xl grid lg:grid-cols-2 gap-12 items-center w-full mx-auto">
          <div className="absolute top-0 right-0 w-96 h-96 bg-moss/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sprout/20 border border-moss/10 rounded-full">
              <Sparkles className="w-4 h-4 text-moss" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-moss">
                Smart Repurposing
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-ink leading-[1.1] tracking-tight">
              Turn kitchen waste into <br />
              <span className="text-moss">wonder.</span>
            </h1>
            <p className="text-lg text-muted max-w-lg leading-relaxed">
              Snap a pic of vegetable peels, eggshells, or coffee grounds. Our
              AI instantly suggests compost recipes, natural fertilizers, and
              DIY cleaners.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/scanner"
                className="group px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-[0_10px_30px_rgba(92,64,51,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <Camera className="w-5 h-5" /> Open Scanner
              </Link>
              <Link
                href="/suggestions"
                className="px-8 py-4 bg-surface text-bark rounded-2xl font-bold text-sm border border-bark/20 hover:bg-sprout/10 transition-all flex items-center gap-3"
              >
                <Package className="w-5 h-5 text-muted" /> View Library
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-moss/5 blur-[60px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 bg-surface rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 border border-bark/10">
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                    {profileData?.rank === "Zero Waste" ? (
                      <Trophy className="w-8 h-8" />
                    ) : (
                      <Scale className="w-8 h-8" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                    3R Lab Rank
                  </span>
                  <h2 className="text-lg font-bold text-ink text-center leading-tight uppercase tracking-tight">
                    {userRank}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full flex flex-col gap-12">
        <section className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-6 min-w-max">
            {[
              {
                label: "Total 3R Lab XP",
                val: (profileData?.totalXP || 0).toLocaleString(),
                icon: Zap,
                color: "text-primary",
                bg: "bg-sprout",
              },
              {
                label: "Impact Score",
                val: `₱${impactScore.toLocaleString()}`,
                icon: DollarSign,
                color: "text-bark",
                bg: "bg-sprout/20",
              },
              {
                label: "Matter Diverted",
                val: `${(profileData?.matterDiverted || 0).toFixed(2)}kg`,
                icon: Leaf,
                color: "text-moss",
                bg: "bg-sprout/30",
              },
              {
                label: "Global Stability",
                val: "94%",
                icon: ShieldCheck,
                color: "text-primary",
                bg: "bg-sprout/10",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-surface border border-bark/10 rounded-[32px] p-8 flex items-center gap-6 w-80 shadow-sm"
              >
                <div
                  className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}
                >
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-ink tabular-nums tracking-tight">
                    {stat.val}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-2xl font-bold tracking-tight text-ink">
              Recent Discoveries
            </h3>
            <Link
              href="/suggestions"
              className="text-sm font-bold text-moss hover:underline flex items-center gap-2"
            >
              View Full Library <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {scanHistory.slice(0, 3).map((scan, i) => (
              <motion.div
                key={scan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-bark/10 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border ${
                      scan.rarity === "Raw"
                        ? "bg-amber-500 text-white border-amber-500/20"
                        : scan.rarity === "Rare Resource"
                          ? "bg-purple-500 text-white border-purple-500/20"
                          : scan.rarity === "Recyclable"
                            ? "bg-blue-500 text-white border-blue-500/20"
                            : scan.rarity === "Reusable"
                              ? "bg-emerald-500 text-white border-emerald-500/20"
                              : "bg-sprout/20 text-muted border-bark/10"
                    }`}
                  >
                    {scan.rarity === "Raw" ? (
                      <Star className="w-6 h-6" />
                    ) : scan.rarity === "Rare Resource" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    {new Date(scan.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-ink mb-1 group-hover:text-moss transition-colors">
                  {scan.item || "Unnamed Item"}
                </h4>
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-2 py-0.5 bg-sprout/10 rounded-lg border border-bark/5">
                    {scan.category}
                  </span>
                </div>
                <div className="pt-4 border-t border-bark/5 flex justify-between items-center">
                  <span className="text-sm font-bold text-moss">
                    +{scan.xp_reward || 10} XP
                  </span>
                  <span className="text-xs font-bold text-bark">
                    ₱{scan.peso_saved || 0} saved
                  </span>
                </div>
              </motion.div>
            ))}
            {scanHistory.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center text-center gap-4 bg-surface border border-dashed border-bark/20 rounded-[40px]">
                <RefreshCw className="w-8 h-8 text-muted" />
                <p className="text-sm font-bold text-muted uppercase tracking-widest">
                  No Recent Activity
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
