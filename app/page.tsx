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
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

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

      const res = await fetch(
        `/api/user?email=${sessionUser.email}&name=${encodeURIComponent(sessionUser.name || sessionUser.email.split("@")[0])}`,
      );
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
  const totalXP = profileData?.totalXP || 0;
  const rankOrder = ["Reducer", "Reuser", "Recycler", "Restorer", "Zero Waste"] as const;
  const rankThresholds = [0, 100, 250, 500, 1000];
  const currentRankIndex = Math.max(0, rankOrder.indexOf(userRank as (typeof rankOrder)[number]));
  const isMaxRank = currentRankIndex >= rankOrder.length - 1;
  const nextRankLabel = isMaxRank ? "Max Rank" : rankOrder[currentRankIndex + 1];
  const currentThreshold = rankThresholds[currentRankIndex];
  const nextThreshold = isMaxRank ? currentThreshold : rankThresholds[currentRankIndex + 1];
  const progressPercent = isMaxRank
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100),
        ),
      );
  const remainingXP = isMaxRank ? 0 : Math.max(0, nextThreshold - totalXP);

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout flex flex-col font-sans text-ink">
      <section className=" mt-24 bg-surface border border-bark/10 p-12 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
        <div>
          <div className="bg-linear-to-r from-page-bg from-30% to-70% to-transparent absolute top-0 left-0 w-full h-full z-2" />
          <Image
            src={"/images/BG.png"}
            alt="Unscrap Background"
            width={1920}
            height={900}
            className="absolute top-0 left-0 w-full h-full object-cover "
          />
        </div>
        <div className="grow grid grid-cols-2 max-w-370 m-30 gap-12 items-center w-full relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-moss/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="space-y-8 relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-primary leading-[1.1] tracking-tight">
              Turn kitchen waste into {" "}
              <span className="text-moss">wonder.</span>
            </h1>
            <p className="text-lg text-muted max-w-xl leading-relaxed">
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
              {/* <Link
                href="/suggestions"
                className="px-8 py-4 bg-surface text-bark rounded-2xl font-bold text-sm border border-bark/20 hover:bg-sprout/10 transition-all flex items-center gap-3"
              >
                <Package className="w-5 h-5 text-muted" /> View Library
              </Link> */}
            </div>
          </div>
        </div>
      </section>
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full flex flex-col gap-12">
        <section className="pb-4 custom-scrollbar">
          <div className="grid lg:grid-cols-2 gap-6">
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
                className="bg-page-bg border border-bark/10 rounded-4xl p-8 flex items-center gap-6 shadow-lg w-full"
              >
                <div
                  className={`w-16 h-16 bg-moss text-[#fdf6ec] rounded-2xl flex items-center justify-center`}
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

        <section className="relative overflow-hidden rounded-[36px] bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944] p-8 md:p-12 text-[#fdf6ec] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,246,236,0.08),transparent_34%)]" />
          <div className="relative grid gap-12 lg:grid-cols-[1.4fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.35em] text-[#efe4d2]/80">
                <Scale className="w-4 h-4" />
                UnScrap Rank
              </div>

              <div className="space-y-5">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                  {userRank}
                </h2>
                <p className="max-w-2xl text-base md:text-lg leading-relaxed text-[#fdf6ec]/90">
                  {isMaxRank
                    ? "You’re at the top of the ladder. Keep scanning to keep your impact climbing."
                    : `You’re ${remainingXP} XP away from ${nextRankLabel}. Keep scanning to unlock the next 3R Lab tier.`}
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-3 rounded-full bg-[#fdf6ec]/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-[#fdf6ec]"
                  />
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] md:text-sm font-medium text-[#fdf6ec]/85">
                  {rankOrder.map((rank, index) => (
                    <span
                      key={rank}
                      className={index <= currentRankIndex ? "text-[#fdf6ec] font-bold" : "text-[#fdf6ec]/55"}
                    >
                      {rank}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative flex h-64 w-64 md:h-80 md:w-80 items-center justify-center rounded-full border-[6px] border-dashed border-[#fdf6ec] text-center shadow-[0_0_0_14px_rgba(253,246,236,0.04)]">
                <div className="space-y-3 px-6">
                  <p className="text-5xl md:text-7xl font-black tracking-tight tabular-nums">
                    {progressPercent}%
                  </p>
                  <p className="text-xl md:text-2xl font-bold leading-tight">
                    To the Next Rank
                  </p>
                  <p className="text-sm md:text-base font-medium text-[#fdf6ec]/80">
                    {isMaxRank ? "Max Rank Reached" : nextRankLabel}
                  </p>
                </div>
              </div>
            </div>
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
