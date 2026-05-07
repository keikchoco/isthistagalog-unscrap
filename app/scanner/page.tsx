"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, RefreshCw, XCircle, Upload, Package, Zap, DollarSign, Star, Gem, ShieldCheck, ChefHat, Leaf, Home, TrendingDown, BarChart3 } from "lucide-react";
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

export default function ScannerPage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentTab, setCurrentTab] = useState<'REEAT' | 'REGROW' | 'RESHINE'>('REEAT');
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
      setTimeout(() => {
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
    } else if (!user) {
      setError("Please sign in to log your impact.");
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsCameraActive(false);
  };

  const userRank = profileData?.rank || "Reducer";

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout grid xl:grid-cols-2 font-sans text-ink pt-28 px-10">
      <main className="pb-12 px-6 max-w-7xl flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <header className="flex justify-between items-center gap-4">
            <div className="w-12 h-12 bg-moss/5 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-moss" />
            </div>
            <h1 className="text-xl font-bold text-ink"><span className="text-primary">Un</span><span className="text-moss">Scrap</span> Scanner</h1>
            <div></div>
          </header>

          <div className="relative aspect-square w-full bg-ink rounded-[48px] overflow-hidden shadow-2xl border-8 border-surface">
            {!image && !isCameraActive ? (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer group"
                onClick={startCamera}
              >
                <Camera className="w-16 h-16 text-white/20 group-hover:text-moss group-hover:scale-110 transition-all duration-500" />
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-white tracking-tight">
                    Ready to scan?
                  </p>
                  <p className="text-xs text-white/40 tracking-wide max-w-xs px-6">
                    Align your food scraps within the frame
                  </p>
                </div>
              </div>
            ) : isCameraActive ? (
              <div className="relative w-full h-full overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
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
                <img
                  src={image!}
                  alt="Captured waste"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-moss/20 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-32 h-32 relative mb-6">
                        <div className="absolute inset-0 border-4 border-moss border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse italic">
                        Scanning Bin...
                      </p>
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink">
                        {item.name}
                      </span>
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

          {error && (
            <p className="text-sm font-bold text-red-500 text-center">
              {error}
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex-1"
            >
              <Upload className="w-5 h-5 text-moss" /> Gallery
            </button>
            <button onClick={startCamera} className="btn-primary flex-2">
              <Camera className="w-5 h-5" /> Launch Camera
            </button>
          </div>

          <div className="text-xs text-muted font-bold uppercase tracking-widest text-center">
            Logged in rank: {userRank}{" "}
            {scanHistory.length > 0
              ? `· ${scanHistory.length} scans loaded`
              : ""}
          </div>
        </div>


      </main>

      {result && (
        <section ref={resultSectionRef} className="w-full bg-primary/10 border-4 border-moss py-20 px-6 rounded-2xl shadow-2xl">
          <div className="max-w-7xl mx-auto space-y-10 text-slate-900">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-accent mb-2">
                      <Zap className="w-4 h-4 fill-current" />
                      <span className="text-[11px] font-bold uppercase tracking-wider leading-none">AI Insight Result</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">The Analysis</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-accent/5 border border-accent/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">XP EARNED</p>
                        <p className="text-lg font-bold text-accent tabular-nums">+{result?.xp_reward || 0}</p>
                      </div>
                    </div>
                    <div className="bg-emerald/5 border border-emerald/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">MONEY SAVED</p>
                        <p className="text-lg font-bold text-emerald-600 tabular-nums">₱{((result?.peso_saved || 0) * 56).toFixed(2)}</p>
                      </div>
                    </div>
                    <button onClick={handleSaveScrap} className="btn-primary h-14 px-8">
                       Log Impact
                    </button>
                  </div>
                </header>

                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between group gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-slate-200 ${
                      result?.rarity === 'Rare Resource' ? 'bg-amber-50 text-amber-500' : 
                      result?.rarity === 'Recyclable' ? 'bg-purple-50 text-purple-500' : 
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {result?.rarity === 'Rare Resource' ? <Star className="w-10 h-10" /> : result?.rarity === 'Recyclable' ? <Gem className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-2">{result?.rarity || 'Common'} Discovery</h4>
                      <p className="text-3xl font-bold text-slate-900 tracking-tight group-hover:text-accent transition-colors">{result?.item || 'Material'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Item Category</p>
                    <p className="text-xl font-bold text-slate-700">{result?.category || 'Scanning...'}</p>
                  </div>
                </div>

                <div className={`p-8 rounded-[40px] border-2 flex items-center gap-6 ${
                  result?.safe_to_use ? 'bg-emerald/5 border-emerald/20 text-emerald' :
                  'bg-amber-400/5 border-amber-400/20 text-amber-400'
                }`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 ${
                        result?.safe_to_use ? 'bg-emerald/20 border-emerald text-emerald' :
                        'bg-amber-400/20 border-amber-400 text-amber-400'
                      }`}>
                         <ShieldCheck className="w-8 h-8" />
                      </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em]">Safety: {result?.safe_to_use ? 'Safe' : 'Caution'}</h4>
                        <span className="px-2 py-0.5 bg-current/10 rounded-full text-[8px] font-black uppercase tracking-widest">AI Verified</span>
                    </div>
                    <p className="text-sm opacity-80 font-medium italic">{result?.safe_to_use ? 'This item is safe to use or dispose of.' : 'Please handle with care.'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 border-b border-slate-100">
                    {[
                      { id: 'REEAT', label: 'RE-EAT', icon: ChefHat },
                      { id: 'REGROW', label: 'RE-GROW', icon: Leaf },
                      { id: 'RESHINE', label: 'RE-SHINE', icon: Home }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id as any)}
                        className={`pb-4 text-xs font-black tracking-widest transition-all flex items-center gap-2 border-b-2 ${currentTab === tab.id ? 'text-accent border-accent' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-1 gap-8">
                    <motion.div 
                      key={currentTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-slate-700 leading-relaxed font-medium min-h-50 bg-slate-50 border border-slate-200 p-8 rounded-3xl"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-accent/5 text-accent rounded-2xl flex items-center justify-center">
                          {currentTab === 'REEAT' && <ChefHat className="w-7 h-7" />}
                          {currentTab === 'REGROW' && <Leaf className="w-7 h-7" />}
                          {currentTab === 'RESHINE' && <Home className="w-7 h-7" />}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            {currentTab === 'REEAT' ? 'Creative Recipe' : currentTab === 'REGROW' ? 'Garden Nutrition' : 'Home Repurpose'}
                          </h4>
                        </div>
                      </div>
                      <p className="text-lg text-slate-600 font-normal whitespace-pre-wrap">
                        {currentTab === 'REEAT' && result?.suggestions.find(s => s.type === 'recipe')?.description}
                        {currentTab === 'REGROW' && result?.suggestions.find(s => s.type === 'compost')?.description}
                        {currentTab === 'RESHINE' && result?.suggestions.find(s => s.type === 'cleaner')?.description}
                      </p>
                    </motion.div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="p-8 bg-slate-50 border border-slate-200 flex items-center gap-6 rounded-3xl">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                      <TrendingDown className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbon Offset</p>
                      <p className="text-2xl font-black text-slate-900">{result?.co2_diverted_grams || 0}g CO2</p>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-50 border border-slate-200 flex items-center gap-6 rounded-3xl">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rarity Score</p>
                      <p className="text-2xl font-black text-slate-900">{result?.rarity}</p>
                    </div>
                  </div>
                </div>
          </div>
        </section>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
