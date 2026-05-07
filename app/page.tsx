'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Leaf, 
  ChefHat, 
  CheckCircle2, 
  XCircle,
  Zap,
  BarChart3,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  MapPin,
  ArrowRight,
  Sparkles,
  LogOut,
  Star,
  Package,
  Trophy,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet component to avoid SSR errors
const CommunityMap = dynamic(() => import('@/components/CommunityMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-sprout/10 animate-pulse rounded-[48px]" />
});

import SuggestionsView from '@/components/SuggestionsView';
import ChatBot from '@/components/ChatBot';

interface AnalysisResult {
  item: string;
  category: string;
  rarity: 'Everyday' | 'Reusable' | 'Recyclable' | 'Rare Resource' | 'Raw';
  safe_to_use: boolean;
  identifiedItems: {
    name: string;
    coordinates: { x: number; y: number; width: number; height: number };
  }[];
  suggestions: {
    title: string;
    description: string;
    type: 'fertilizer' | 'cleaner' | 'compost' | 'recipe' | 'other';
  }[];
  co2_diverted_grams: number;
  peso_saved: number;
  xp_reward: number;
}

export default function Home() {
  const [view, setView] = useState<'home' | 'scanner' | 'community' | 'impact' | 'suggestions'>('home');
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock Login
  const handleLogin = async () => {
    const email = 'manaigeurie20@gmail.com';
    const res = await fetch(`/api/user?email=${email}`);
    const data = await res.json();
    setUser({ email, displayName: data.displayName });
    setProfileData(data);
    fetchHistory(email);
  };

  const handleLogout = () => {
    setUser(null);
    setProfileData(null);
    setScanHistory([]);
  };

  const fetchHistory = async (email: string) => {
    const res = await fetch(`/api/scans?userId=${email}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setScanHistory(data);
    }
  };

  useEffect(() => {
    // Check local storage or similar for session would go here
    // For now, let's keep it logged out until they click "Get Started"
  }, []);

  const userRank = profileData?.rank || "Reducer";
  const totalSaved = profileData?.matterDiverted || 0;
  const impactScore = profileData?.impactScore || 0;

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
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

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        processImage(dataUrl, 'image/jpeg');
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        processImage(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string, mimeType: string) => {
    setImage(base64);
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setShowDrawer(false);

    try {
      const base64Data = base64.split(',')[1];
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64Data, 
          mimeType, 
          userId: user?.email || 'anonymous' 
        })
      });
      
      const analysisResult = await res.json();
      if (analysisResult.error) throw new Error(analysisResult.error);
      
      setResult(analysisResult);
      setShowDrawer(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveScrap = async () => {
    if (result && user) {
      // Logic handled in API now, just refresh
      const res = await fetch(`/api/user?email=${user.email}`);
      const data = await res.json();
      setProfileData(data);
      fetchHistory(user.email);
      setShowDrawer(false);
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
    setShowDrawer(false);
  };

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout flex flex-col font-sans text-ink">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-surface/80 backdrop-blur-xl border-b border-bark/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Trash2 className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">Unscrap</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            {[
              { id: 'scanner', label: 'Scanner' },
              { id: 'suggestions', label: 'Suggestions' },
              { id: 'impact', label: 'Impact' },
              { id: 'community', label: 'Community' }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id as any)}
                className={`hover:text-moss transition-colors ${view === item.id ? 'text-moss' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">Welcome Back</span>
                  <span className="text-xs font-bold text-ink">{user.displayName || 'User'}</span>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-bark/20 bg-sprout">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" />
                </div>
                <button onClick={handleLogout} className="p-2 text-muted hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={handleLogin} className="px-5 py-2 text-sm font-bold text-bark bg-sprout/20 rounded-xl hover:bg-sprout/30 transition-all">Log In</button>
                <button onClick={handleLogin} className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-12"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center bg-surface border border-bark/10 rounded-[48px] p-12 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-moss/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="space-y-8 relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-sprout/20 border border-moss/10 rounded-full">
                    <Sparkles className="w-4 h-4 text-moss" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-moss">Smart Repurposing</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold text-ink leading-[1.1] tracking-tight">
                    Turn kitchen waste into <br/><span className="text-moss">wonder.</span>
                  </h2>
                  <p className="text-lg text-muted max-w-lg leading-relaxed">
                    Snap a pic of vegetable peels, eggshells, or coffee grounds. Our AI instantly suggests compost recipes, natural fertilizers, and DIY cleaners.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={() => setView('scanner')} className="group px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-[0_10px_30px_rgba(92,64,51,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                      <Camera className="w-5 h-5" /> Open Scanner
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-surface text-bark rounded-2xl font-bold text-sm border border-bark/20 hover:bg-sprout/10 transition-all flex items-center gap-3">
                      <Upload className="w-5 h-5 text-muted" /> Upload Photo
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="relative w-64 h-64 md:w-80 md:h-80">
                    <div className="absolute inset-0 bg-moss/5 blur-[60px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-48 h-48 bg-surface rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 border border-bark/10">
                            <div className="absolute -top-6 -right-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                                {profileData?.rank === 'Zero Waste' ? <Trophy className="w-8 h-8" /> : <Scale className="w-8 h-8" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">3R Lab Rank</span>
                            <h4 className="text-lg font-bold text-ink text-center leading-tight uppercase tracking-tight">{userRank}</h4>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-6 min-w-max">
                  {[
                    { label: "Total 3R Lab XP", val: (profileData?.totalXP || 0).toLocaleString(), icon: Zap, color: "text-primary", bg: "bg-sprout" },
                    { label: "Impact Score", val: `₱${(impactScore || 0).toLocaleString()}`, icon: DollarSign, color: "text-bark", bg: "bg-sprout/20" },
                    { label: "Matter Diverted", val: `${(profileData?.matterDiverted || 0).toFixed(2)}kg`, icon: Leaf, color: "text-moss", bg: "bg-sprout/30" },
                    { label: "Global Stability", val: "94%", icon: ShieldCheck, color: "text-primary", bg: "bg-sprout/10" },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="bg-surface border border-bark/10 rounded-[32px] p-8 flex items-center gap-6 w-80 shadow-sm"
                    >
                      <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                        <stat.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted tracking-wider mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-ink tabular-nums tracking-tight">{stat.val}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold tracking-tight text-ink">Recent Discoveries</h3>
                  <button onClick={() => setView('suggestions')} className="text-sm font-bold text-moss hover:underline flex items-center gap-2">
                    View Full Library <ArrowRight className="w-4 h-4" />
                  </button>
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
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border ${
                                scan.rarity === 'Raw' ? 'bg-amber-500 text-white border-amber-500/20' : 
                                scan.rarity === 'Rare Resource' ? 'bg-purple-500 text-white border-purple-500/20' : 
                                scan.rarity === 'Recyclable' ? 'bg-blue-500 text-white border-blue-500/20' :
                                scan.rarity === 'Reusable' ? 'bg-emerald-500 text-white border-emerald-500/20' :
                                'bg-sprout/20 text-muted border-bark/10'
                            }`}>
                                {scan.rarity === 'Raw' ? <Star className="w-6 h-6" /> : scan.rarity === 'Rare Resource' ? <CheckCircle2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{new Date(scan.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-xl font-bold text-ink mb-1 group-hover:text-moss transition-colors">{scan.item || 'Unnamed Item'}</h4>
                        <div className="flex gap-2 mb-4">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-2 py-0.5 bg-sprout/10 rounded-lg border border-bark/5">
                                {scan.category}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-bark/5 flex justify-between items-center">
                            <span className="text-sm font-bold text-moss">+{scan.xp_reward || 10} XP</span>
                            <span className="text-xs font-bold text-bark">₱{scan.peso_saved || 0} saved</span>
                        </div>
                    </motion.div>
                  ))}
                  {scanHistory.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center text-center gap-4 bg-surface border border-dashed border-bark/20 rounded-[40px]">
                        <RefreshCw className="w-8 h-8 text-muted" />
                        <p className="text-sm font-bold text-muted uppercase tracking-widest">No Recent Activity</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'scanner' && (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[70vh]"
            >
              <div className="w-full max-w-2xl flex flex-col gap-6">
                <header className="flex justify-between items-center">
                  <button onClick={() => setView('home')} className="p-3 bg-surface border border-bark/10 rounded-2xl text-muted hover:text-ink transition-colors shadow-sm">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <h3 className="text-xl font-bold text-ink">The 3R Lab Scanner</h3>
                  <div className="w-12 h-12 bg-moss/5 rounded-2xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-moss" />
                  </div>
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
                        <button onClick={stopCamera} className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center text-muted hover:text-red-500 transition-all shadow-xl">
                          <XCircle className="w-8 h-8" />
                        </button>
                        <button onClick={captureImage} className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center text-dark-bg shadow-[0_15px_40px_rgba(92,64,51,0.4)] hover:scale-110 active:scale-95 transition-all border-4 border-white/20">
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
                      {!isAnalyzing && result && result.identifiedItems.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bg-surface/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl ring-1 ring-black/5"
                          style={{
                            left: `${item.coordinates.x / 10 + item.coordinates.width / 20}%`,
                            top: `${item.coordinates.y / 10 + item.coordinates.height / 20}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-moss" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-ink">{item.name}</span>
                        </motion.div>
                      ))}
                      {!isAnalyzing && (
                        <button onClick={handleClear} className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-surface/90 backdrop-blur border border-bark/10 flex items-center justify-center text-muted hover:text-moss shadow-xl transition-all">
                          <RefreshCw className="w-7 h-7" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1">
                    <Upload className="w-5 h-5 text-moss" /> Gallery
                  </button>
                  <button onClick={startCamera} className="btn-primary flex-[2]">
                    <Camera className="w-5 h-5" /> Launch Camera
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'suggestions' && (
            <motion.div 
              key="suggestions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <SuggestionsView history={scanHistory} />
            </motion.div>
          )}

          {view === 'impact' && (
            <motion.div 
              key="impact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 space-y-12"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: "Waste Diverted", val: `${totalSaved.toFixed(2)}kg`, icon: Leaf, color: "text-moss", bg: "bg-sprout/30" },
                  { label: "Impact Score", val: `₱${(impactScore || 0).toLocaleString()}`, icon: DollarSign, color: "text-bark", bg: "bg-sprout/20" },
                  { label: "XP Earned", val: (profileData?.totalXP || 0).toLocaleString(), icon: Zap, color: "text-primary", bg: "bg-sprout" },
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
                    <h3 className="text-3xl font-black tracking-tight">The {userRank} Progress</h3>
                    <p className="max-w-md opacity-80 font-medium">You've reached the status of <span className="underline decoration-white/50">{userRank}</span>. Collect more XP to unlock the secrets of the Zero Waste rank.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'community' && (
            <motion.div 
              key="community"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-8 min-h-[70vh]"
            >
              <CommunityMap user={user} />
            </motion.div>
          )}
        </AnimatePresence>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        <canvas ref={canvasRef} className="hidden" />
      </main>

      <AnimatePresence>
        {showDrawer && result && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-[48px] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto my-4" />
              <div className="p-10 flex-1 overflow-y-auto space-y-10 custom-scrollbar bg-white text-slate-900">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Analysis Result</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleSaveScrap} className="btn-primary h-14 px-8">Log Impact</button>
                    <button onClick={() => setShowDrawer(false)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </header>

                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-4xl">
                      <Package className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{result.rarity} Discovery</p>
                      <p className="text-3xl font-bold text-slate-900">{result.item}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase text-muted text-center tracking-widest">3R Recommendations</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="bg-surface border border-bark/10 p-6 rounded-3xl space-y-3 border-l-4 border-l-moss">
                        <span className="text-[10px] font-black uppercase text-moss bg-moss/10 px-2 py-1 rounded-lg">{suggestion.type}</span>
                        <h5 className="font-bold text-ink text-lg">{suggestion.title}</h5>
                        <p className="text-sm text-bark leading-relaxed">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChatBot />
    </div>
  );
}
