"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Leaf,
  Scale,
  Diamond,
  DollarSign,
  ShieldCheck,
  Trophy,
  FileText,
  Download,
  Share2,
  ClipboardCopy,
  Medal,
  Award,
  ArrowRight,
  Package,
  Star,
  Gem,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface ProfileViewProps {
  user: any;
  profileData: any;
  scanHistory: any[];
  onBack: () => void;
  shareAccountId?: string | null;
}

type LevelDef = {
  title: string;
  xp: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const rankLevels: LevelDef[] = [
  { title: "Reducer", xp: 0, icon: Scale, color: "text-slate-400" },
  { title: "Reuser", xp: 1000, icon: Leaf, color: "text-emerald-400" },
  { title: "Recycler", xp: 5000, icon: RefreshCw, color: "text-blue-400" },
  { title: "Restorer", xp: 20000, icon: Trophy, color: "text-amber-400" },
  { title: "Zero Waste", xp: 30000, icon: Diamond, color: "text-accent" },
];

export default function ProfileView({ user, profileData, scanHistory, onBack, shareAccountId }: ProfileViewProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<LevelDef | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!user) return null;

  const data = profileData || {
    totalXP: 0,
    totalSavedKg: 0,
    totalMoneySavedUsd: 0,
    titlesEarned: ["The Initiate"],
    rank: "Reducer",
  };

  const earnedCertificates = rankLevels.filter((level) => data.totalXP >= level.xp);

  const rankOrder = ["Reducer", "Reuser", "Recycler", "Restorer", "Zero Waste"] as const;
  const rankThresholds = [0, 1000, 5000, 20000, 30000];
  let currentRankIndex = 0;
  for (let i = rankThresholds.length - 1; i >= 0; i--) {
    if (data.totalXP >= rankThresholds[i]) {
      currentRankIndex = i;
      break;
    }
  }

  const calculatedRank = rankOrder[currentRankIndex];
  const isMaxRank = currentRankIndex >= rankOrder.length - 1;
  const nextRankLabel = isMaxRank ? "Max Rank" : rankOrder[currentRankIndex + 1];
  const currentThreshold = rankThresholds[currentRankIndex];
  const nextThreshold = isMaxRank ? currentThreshold : rankThresholds[currentRankIndex + 1];
  const nextRankProgressPercent = isMaxRank
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(((data.totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100),
        ),
      );
  const progressPercent = Math.round(
    (currentRankIndex + nextRankProgressPercent / 100) * (100 / (rankOrder.length - 1)),
  );

  const stats = [
    {
      label: "Total Alchemical",
      val: data.totalXP.toLocaleString(),
      sub: "XP Gained",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Impact Score",
      val: `₱${Math.round((data.totalMoneySavedUsd || 0) * 56).toLocaleString()}`,
      sub: "Savings Value",
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/5",
    },
    {
      label: "Matter Diverted",
      val: `${(data.totalSavedKg || 0).toFixed(2)}kg`,
      sub: "Total Scraps",
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Global Stability",
      val: data.totalXP >= 5000 ? "Top 4%" : "Rising",
      sub: "World Rank",
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  const getScanLabel = (scan: any) => scan?.item || scan?.itemName || "Discovery";
  const getScanXp = (scan: any) => scan?.xp_reward ?? scan?.xpEarned ?? 10;
  const getScanSaved = (scan: any) => scan?.peso_saved ?? ((scan?.moneySavedUsd || 0) * 56);
  const getScanSuggestions = (scan: any) => scan?.suggestions || scan?.items || [];

  const resolveScanKey = (scan: any, index: number) => scan?._id || scan?.id || `${getScanLabel(scan)}-${index}`;

  const resolveScanDate = (scan: any) => {
    const rawTimestamp = scan?.timestamp;
    if (!rawTimestamp) return new Date();
    if (typeof rawTimestamp === "string" || typeof rawTimestamp === "number") return new Date(rawTimestamp);
    if (typeof rawTimestamp?.toDate === "function") return rawTimestamp.toDate();
    return new Date(rawTimestamp);
  };

  const shareProfile = async () => {
    const profilePath = shareAccountId ? `/profile/${encodeURIComponent(shareAccountId)}` : "/profile";
    const url = `${window.location.origin}${profilePath}`;

    await navigator.clipboard.writeText(url);
    setToastMessage("Profile link copied to clipboard");
    window.setTimeout(() => setToastMessage(null), 2200);
  };

  return (
    <div className="space-y-12">
      <div className="bg-white border border-slate-100 rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944] flex items-center justify-center text-white text-4xl font-black">
              {(user.displayName || user.name || user.email || "U")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part: string) => part[0]?.toUpperCase())
                .join("")
                .slice(0, 2) || "U"}
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 border-4 border-white">
              <Zap className="w-6 h-6 fill-current" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{user.displayName || user.name || user.email}</h2>
              <p className="text-slate-500 font-medium">@{user.email?.split("@")[0] || "member"}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-2 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-2">
                <Medal className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{calculatedRank}</span>
              </div>
              <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Rank: {calculatedRank}</span>
              </div>
              <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Rank: {nextRankLabel}</span>
              </div>
            </div>

            <div className="max-w-md">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>XP Progress</span>
                <span>{isMaxRank ? "MAX" : `${data.totalXP} / ${nextThreshold} XP`}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nextRankProgressPercent}%` }}
                  className="h-full bg-accent shadow-[0_0_15px_rgba(255,138,0,0.4)]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={shareProfile}
              className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-3"
            >
              <ClipboardCopy className="w-4 h-4 text-slate-400" /> Copy Profile Link
            </button>
            <button onClick={onBack} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Scanner
            </button>
          </div>
        </div>
      </div>

    
    
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-slate-900 mb-1">{stat.val}</h4>
            <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Logged Impacts</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{scanHistory.length} Total Projects</span>
          </div>

          <div className="space-y-4">
            {scanHistory.map((scan, i) => (
              <motion.div
                key={resolveScanKey(scan, i)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-100 rounded-4xl p-6 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-lg transition-all"
              >
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-2xl shadow-sm border ${
                  scan.rarity === "Legendary"
                    ? "bg-amber-50 text-amber-500 border-amber-100"
                    : scan.rarity === "Rare"
                      ? "bg-purple-50 text-purple-500 border-purple-100"
                      : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                  {scan.rarity === "Legendary" ? <Star className="w-7 h-7" /> : scan.rarity === "Rare" ? <Gem className="w-7 h-7" /> : <Package className="w-7 h-7" />}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-accent transition-colors">{getScanLabel(scan)}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{resolveScanDate(scan).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {getScanSuggestions(scan).slice(0, 3).map((item: any, j: number) => (
                      <span key={j} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        {typeof item === "object" ? item.name || item.title || item.type : item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-1 min-w-30">
                  <span className="text-sm font-black text-accent">+{getScanXp(scan)} XP</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Saved ₱{getScanSaved(scan).toFixed(0)}</span>
                </div>
              </motion.div>
            ))}

            {scanHistory.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 rounded-[40px] py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                No projects logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Certificates</h3>
            <span className="p-2 bg-accent/10 text-accent rounded-lg">
              <Trophy className="w-5 h-5" />
            </span>
          </div>

          <div className="space-y-4">
            {earnedCertificates.map((level, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-4xl p-6 shadow-sm group">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center ${level.color}`}>
                    <level.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{level.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Achieved at {level.xp} XP</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelectedCertificate(level)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                    <FileText className="w-3 h-3" /> View
                  </button>
                  <button className="flex-1 py-3 bg-accent/10 text-accent rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent/20 transition-all">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            ))}

            {rankLevels.filter((level) => data.totalXP < level.xp).map((level, i) => (
              <div key={i} className="bg-slate-50/50 border border-dashed border-slate-200 rounded-4xl p-6 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                    <Medal className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400">{level.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Unlocks at {level.xp} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl aspect-[1.414/1] bg-white rounded-lg shadow-2xl overflow-hidden p-12 flex flex-col relative border-12 border-accent/20"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-32 h-32 border-l-16 border-t-16 border-accent/40 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-32 h-32 border-r-16 border-t-16 border-accent/40 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-l-16 border-b-16 border-accent/40 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-r-16 border-b-16 border-accent/40 rounded-br-xl" />

              <div className="flex-1 border-2 border-accent/10 rounded overflow-hidden p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-8">
                  <selectedCertificate.icon className="w-12 h-12" />
                </div>

                <h2 className="text-4xl font-bold text-slate-900 uppercase tracking-tighter mb-2 italic underline decoration-accent">Certificate of Achievement</h2>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs mb-12">Unscrap Achievement Society</p>

                <p className="text-xl text-slate-500 italic mb-4">This is to certify that</p>
                <h3 className="text-5xl font-black text-slate-900 mb-8 font-serif leading-tight">{user.displayName || user.name || user.email}</h3>

                <p className="text-slate-600 max-w-md font-medium leading-relaxed mb-12">
                  Has successfully transmuted waste into wonder and attained the prestigious level of <span className="font-bold text-accent">{selectedCertificate.title}</span>.
                </p>

                <div className="flex justify-between w-full mt-auto">
                  <div className="text-left">
                    <div className="w-32 h-px bg-slate-300 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Conferred</p>
                    <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-px bg-slate-300 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Society Seal</p>
                    <p className="text-sm font-bold text-accent underline decoration-accent">Verified AI</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}