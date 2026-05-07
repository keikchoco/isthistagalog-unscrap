"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Diamond,
  DollarSign,
  Leaf,
  Package,
  PiggyBank,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
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
    <div className="min-h-screen bg-linear-to-b from-[#6B8F5E]/30 to-white selection:bg-sprout flex flex-col font-sans text-ink">
      <section className="relative mt-20 overflow-hidden border border-bark/10 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.03)] sm:mt-24 lg:mt-24 lg:p-12">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-b from-page-bg via-page-bg/80 to-transparent lg:bg-linear-to-r lg:from-page-bg lg:from-30% lg:to-70% lg:to-transparent" />
          <Image
            src={"/images/BG.png"}
            alt="Unscrap Background"
            width={1920}
            height={900}
            className="h-full w-full object-cover object-center opacity-25 sm:opacity-35 lg:opacity-100"
          />
        </div>
        <div className="relative mx-auto grid min-h-dvh w-full items-center gap-10 px-6 py-12 sm:px-8 sm:py-16 lg:min-h-0 lg:grow lg:grid-cols-2 lg:max-w-370 lg:m-30 lg:gap-12 lg:px-0 lg:py-0">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-moss/5 blur-[100px] lg:h-96 lg:w-96" />

          <div className="relative z-10 space-y-6 text-center lg:text-left sm:space-y-8">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-5xl lg:leading-[1.1] lg:tracking-tight xl:text-7xl">
              Turn kitchen waste <br className="hidden xl:block"/>into <span className="text-moss underline underline-offset-8 decoration-4 lg:text-8xl">Wonder.</span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
              Snap a pic of vegetable peels, eggshells, or coffee grounds. Our
              AI instantly suggests compost recipes, natural fertilizers, and
              DIY cleaners.
            </p>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Link
                href="/scanner"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(92,64,51,0.2)] transition-all hover:scale-105 active:scale-95 sm:w-auto"
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

      
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-6 lg:pt-24">
        <section className="pb-4 custom-scrollbar">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                label: "Scrap XP",
                val: (profileData?.totalXP || 0).toLocaleString(),
                icon: Zap,
                color: "text-primary",
                bg: "bg-sprout",
              },
              {
                label: "Saving",
                val: `₱${impactScore.toLocaleString()}`,
                icon: PiggyBank,
                color: "text-bark",
                bg: "bg-sprout/20",
              },
              {
                label: "Scraps Rescued",
                val: `${(profileData?.matterDiverted || 0).toFixed(2)}kg`,
                icon: Leaf,
                color: "text-moss",
                bg: "bg-sprout/30",
              },
              {
                label: "Eco Score",
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

        <section className="relative overflow-hidden rounded-[36px] bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944] p-8 md:py-8 md:px-12 text-[#fdf6ec] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,246,236,0.08),transparent_34%)]" />
          <div className="relative grid gap-12 lg:grid-cols-[1.4fr_0.9fr] items-center">
            <div className="space-y-6">
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


            <div className="flex justify-center lg:justify-end mt-10 lg:mt-0">
              <div className="relative flex size-70 items-center justify-center rounded-full border-[6px] border-dashed border-[#fdf6ec] text-center shadow-[0_0_0_14px_rgba(253,246,236,0.04)]">
                <div className="space-y-3 px-6">
                  <p className="text-5xl md:text-6xl font-black tracking-tight tabular-nums">
                    {nextRankProgressPercent}%
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
            <h3 className="text-lg font-semibold tracking-tight text-white px-8 py-2 rounded-xl bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944]">
              Recent Discoveries
            </h3>
            {sessionUser && (
              <Link
                href="/library"
                className="font-bold text-moss hover:underline flex items-center gap-2"
              >
                View The Bin <ArrowRight className="size-5" />
              </Link>
            )}
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
              <div className="col-span-full py-16 flex flex-col items-center text-center gap-4 bg-page-bg border-2 border-dashed border-bark rounded-[40px]">
                <div className="w-16 h-16 rounded-2xl bg-moss flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-moss">
                    {!sessionUser
                      ? "Sign in to get started"
                      : "Nothing here yet"}
                  </p>
                  <p className=" text-primary font-light max-w-sm">
                    {!sessionUser
                      ? "Log in to start scanning kitchen waste and building your collection."
                      : "Scan your first kitchen scrap to start building your collection in The Bin."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
