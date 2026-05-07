"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  ChefHat,
  ChevronRight,
  DollarSign,
  Gem,
  Home,
  Leaf,
  Package,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingDown,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface AnalysisResult {
  item: string;
  category: string;
  rarity: "Everyday" | "Reusable" | "Recyclable" | "Rare Resource" | "Raw";
  safe_to_use: boolean;
  identifiedItems: {
    name: string;
    coordinates: { x: number; y: number; width: number; height: number };
  }[];
  suggestions: {
    title: string;
    description: string;
    type: "fertilizer" | "cleaner" | "compost" | "recipe" | "other";
  }[];
  co2_diverted_grams: number;
  peso_saved: number;
  xp_reward: number;
}

const tabConfig = [
  { id: "REEAT", label: "RE-EAT", icon: ChefHat, type: "recipe" as const },
  { id: "REGROW", label: "RE-GROW", icon: Leaf, type: "compost" as const },
  { id: "RESHINE", label: "RE-SHINE", icon: Home, type: "cleaner" as const },
] as const;

type ScannerTab = (typeof tabConfig)[number]["id"];

export default function ScannerPage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentTab, setCurrentTab] = useState<ScannerTab>("REEAT");
  const [showDetails, setShowDetails] = useState(false);
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (result && resultSectionRef.current) {
      window.setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setIsCameraActive(false);
      setError("Unable to access camera.");
    }
  };

  const processImage = async (base64: string, mimeType: string) => {
    setImage(base64);
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setShowDetails(false);

    try {
      const base64Data = base64.split(",")[1];
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          mimeType,
          userId: user?.email || "anonymous",
        }),
      });

      const analysisResult = await res.json();
      if (analysisResult.error) throw new Error(analysisResult.error);

      setResult(analysisResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        processImage(dataUrl, "image/jpeg");
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      processImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveScrap = async () => {
    if (result && user) {
      const res = await fetch(`/api/user?email=${user.email}`);
      const data = await res.json();
      setProfileData(data);

      const historyRes = await fetch(`/api/scans?userId=${user.email}`);
      const historyData = await historyRes.json();
      if (Array.isArray(historyData)) {
        setScanHistory(historyData);
      }

      setImage(null);
      setResult(null);
      setShowDetails(false);
    } else if (!user) {
      setError("Please sign in to log your impact.");
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsCameraActive(false);
    setShowDetails(false);
  };

  const activeTab = tabConfig.find((tab) => tab.id === currentTab) ?? tabConfig[0];
  const selectedSuggestion =
    result?.suggestions.find((suggestion) => suggestion.type === activeTab.type) ??
    result?.suggestions[0];
  // Get all suggestions of current tab type for filtering
  const tabSuggestions = result?.suggestions.filter((s) => s.type === activeTab.type) ?? [];
  const userRank = profileData?.rank || "Reducer";

  return (
    <div className={`min-h-screen bg-white selection:bg-sprout font-sans text-ink pt-28 px-10 transition-all duration-700 ${
      result ? "grid xl:grid-cols-2 gap-10" : "flex justify-center"
    }`}>
      <main className={`pb-12 px-6 max-w-7xl flex flex-col ${
        result ? "items-start justify-start" : "items-center justify-center flex-1 w-full"
      }`}>
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <header className="flex justify-between items-center gap-4">
            <div className="w-12 h-12 bg-moss/5 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-moss" />
            </div>
            <h1 className="text-xl font-bold text-ink">
              <span className="text-primary">Un</span>
              <span className="text-moss">Scrap</span> Scanner
            </h1>
            <div />
          </header>

          <div className="relative aspect-square w-full bg-ink rounded-[48px] overflow-hidden shadow-2xl border-8 border-surface">
            {!image && !isCameraActive ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer group" onClick={startCamera}>
                <Camera className="w-16 h-16 text-white/20 group-hover:text-moss group-hover:scale-110 transition-all duration-500" />
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-white tracking-tight">Ready to scan?</p>
                  <p className="text-xs text-white/40 tracking-wide max-w-xs px-6">Align your food scraps within the frame</p>
                </div>
              </div>
            ) : isCameraActive ? (
              <div className="relative w-full h-full overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                  <button
                    onClick={stopCamera}
                    className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center text-muted hover:text-red-500 transition-all shadow-xl"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                  <button
                    onClick={captureImage}
                    className="w-24 h-24 rounded-4xl bg-primary flex items-center justify-center text-dark-bg shadow-[0_15px_40px_rgba(92,64,51,0.4)] hover:scale-110 active:scale-95 transition-all border-4 border-white/20"
                  >
                    <Camera className="w-10 h-10" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img src={image!} alt="Captured waste" className="w-full h-full object-cover" />
                {isAnalyzing && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-moss/20 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-32 h-32 relative mb-6">
                        <div className="absolute inset-0 border-4 border-moss border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse italic">Scanning Bin...</p>
                    </div>
                  </div>
                )}
                {!isAnalyzing &&
                  result &&
                  result.identifiedItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bg-surface/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl ring-1 ring-black/5"
                      style={{
                        left: `${item.coordinates.x / 10 + item.coordinates.width / 20}%`,
                        top: `${item.coordinates.y / 10 + item.coordinates.height / 20}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-moss" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink">{item.name}</span>
                    </motion.div>
                  ))}
                {!isAnalyzing && (
                  <button
                    onClick={handleClear}
                    className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-surface/90 backdrop-blur border border-bark/10 flex items-center justify-center text-muted hover:text-moss shadow-xl transition-all"
                  >
                    <RefreshCw className="w-7 h-7" />
                  </button>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}

          <div className="flex gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1">
              <Upload className="w-5 h-5 text-moss" /> Gallery
            </button>
            <button onClick={startCamera} className="btn-primary flex-2">
              <Camera className="w-5 h-5" /> Launch Camera
            </button>
          </div>

          <div className="text-xs text-muted font-bold uppercase tracking-widest text-center">
            Logged in rank: {userRank} {scanHistory.length > 0 ? `· ${scanHistory.length} scans loaded` : ""}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultSectionRef}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-3xl flex flex-col gap-6 transition-all duration-700 lg:sticky lg:top-8 self-start"
          >
            <header className="flex justify-between items-center">
              <button
                onClick={handleClear}
                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold text-slate-900">Results</h3>
              <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent fill-current" />
              </div>
            </header>

            <div className="bg-white rounded-[48px] shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-slate-100 p-10 space-y-10">
              <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex items-center gap-4">
                  {showDetails && (
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                      {showDetails ? selectedSuggestion?.title || "Recommendation Analysis" : "The Analysis"}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-nowrap items-center gap-3">
                  <div className="bg-accent/5 border border-accent/10 px-3 py-2 rounded-2xl flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center text-white">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">XP</p>
                      <p className="text-sm font-bold text-accent tabular-nums">+{result.xp_reward || 0}</p>
                    </div>
                  </div>
                  <div className="bg-emerald/5 border border-emerald/10 px-3 py-2 rounded-2xl flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">SAVED</p>
                      <p className="text-sm font-bold text-emerald-600 tabular-nums">₱{((result.peso_saved || 0) * 56).toFixed(0)}</p>
                    </div>
                  </div>
                  <button onClick={handleSaveScrap} className="btn-primary h-12 px-4 text-sm scale-90 origin-right">
                    Log Impact
                  </button>
                </div>
              </header>

              {!showDetails ? (
                <>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-4xl flex flex-col sm:flex-row items-center justify-between group gap-4 text-slate-900 text-sm">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-200 ${
                          result.rarity === "Rare Resource"
                            ? "bg-amber-50 text-amber-500"
                            : result.rarity === "Recyclable"
                              ? "bg-purple-50 text-purple-500"
                              : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {result.rarity === "Rare Resource" ? (
                          <Star className="w-6 h-6" />
                        ) : result.rarity === "Recyclable" ? (
                          <Gem className="w-6 h-6" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-1">{result.rarity || "Common"}</h4>
                        <p className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-accent transition-colors">{result.item || "Material"}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-right">Analysis</p>
                      <p className="font-bold text-slate-700">{result.category || "Scanning..."}</p>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-4xl border-2 flex items-center gap-4 ${
                      result.safe_to_use
                        ? "bg-emerald/5 border-emerald/20 text-emerald"
                        : "bg-amber-400/5 border-amber-400/20 text-amber-400"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                        result.safe_to_use
                          ? "bg-emerald/20 border-emerald text-emerald"
                          : "bg-amber-400/20 border-amber-400 text-amber-400"
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">Safety: {result.safe_to_use ? "Safe" : "Caution"}</h4>
                        <span className="px-2 py-0.5 bg-current/10 rounded-full text-[8px] font-black uppercase tracking-widest">AI Verified</span>
                      </div>
                      <p className="text-xs opacity-80 font-medium italic leading-tight">
                        {result.safe_to_use ? "This item is safe to use or dispose of." : "Please handle with care."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 border-b border-slate-100">
                      {tabConfig.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setCurrentTab(tab.id);
                            setShowDetails(false);
                          }}
                          className={`pb-2 text-[10px] font-black tracking-widest transition-all flex items-center gap-1.5 border-b-2 ${
                            currentTab === tab.id ? "text-accent border-accent" : "text-slate-400 border-transparent hover:text-slate-600"
                          }`}
                        >
                          <tab.icon className="w-3 h-3" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <motion.div
                      key={currentTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-panel p-6 text-slate-700 leading-relaxed font-medium min-h-40 rounded-4xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/5 text-accent rounded-xl flex items-center justify-center">
                            {currentTab === "REEAT" && <ChefHat className="w-5 h-5" />}
                            {currentTab === "REGROW" && <Leaf className="w-5 h-5" />}
                            {currentTab === "RESHINE" && <Home className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{selectedSuggestion?.title || "Recommendation"}</h4>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{selectedSuggestion?.type || "analysis"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDetails(true)}
                          className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          View Analysis <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 font-normal whitespace-pre-wrap leading-relaxed line-clamp-3">
                        {selectedSuggestion?.description || "No recommendation available."}
                      </p>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-slate-900">
                    <div className="glass-panel p-5 bg-slate-50 border-none flex items-center gap-4 rounded-[28px]">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CO2 Offset</p>
                        <p className="text-lg font-black text-slate-900">{result.co2_diverted_grams || 0}g</p>
                      </div>
                    </div>
                    <div className="glass-panel p-5 bg-slate-50 border-none flex items-center gap-4 rounded-[28px]">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rarity Score</p>
                        <p className="text-lg font-black text-slate-900">{result.rarity}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="glass-panel p-8 rounded-[40px] bg-slate-50 border-none">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                      <RefreshCw className="w-6 h-6 text-accent" />
                      Recommendation Analysis
                    </h3>
                    <div className="space-y-4">
                      {tabSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-accent group-hover:text-accent transition-colors shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-1">{suggestion.type}</p>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">{suggestion.title}</h4>
                            <p className="text-slate-600 font-medium leading-relaxed">{suggestion.description}</p>
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 text-sm font-bold rounded-lg transition-all"
                            >
                              <span>🎬 View on YouTube</span>
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-[40px] border-accent/20 bg-accent/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <Package className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 leading-none mb-1">Recommendation Analysis</h4>
                          <p className="text-xs text-slate-500 font-medium">Detailed suggestions for {activeTab.label}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowDetails(false)} className="btn-primary h-12 px-6 text-sm whitespace-nowrap">
                        Back to Overview <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
