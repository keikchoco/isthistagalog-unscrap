'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, RefreshCw, XCircle, Upload, Package } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

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

export default function ScannerPage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setIsCameraActive(false);
      setError('Unable to access camera.');
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
        body: JSON.stringify({ image: base64Data, mimeType, userId: user?.email || 'anonymous' }),
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

      setShowDrawer(false);
      setImage(null);
      setResult(null);
    } else if (!user) {
      setError('Please sign in to log your impact.');
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsCameraActive(false);
    setShowDrawer(false);
  };

  const userRank = profileData?.rank || 'Reducer';

  return (
    <div className="min-h-screen bg-page-bg selection:bg-sprout flex flex-col font-sans text-ink">
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <header className="flex justify-between items-center gap-4">
            <div className="w-12 h-12 bg-moss/5 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-moss" />
            </div>
            <h1 className="text-xl font-bold text-ink">The 3R Lab Scanner</h1>
            <span className="text-sm font-bold text-muted">{user?.displayName || user?.email || 'Guest'}</span>
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
                      transform: 'translate(-50%, -50%)',
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

          {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}

          <div className="flex gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1">
              <Upload className="w-5 h-5 text-moss" /> Gallery
            </button>
            <button onClick={startCamera} className="btn-primary flex-[2]">
              <Camera className="w-5 h-5" /> Launch Camera
            </button>
          </div>

          <div className="text-xs text-muted font-bold uppercase tracking-widest text-center">
            Logged in rank: {userRank} {scanHistory.length > 0 ? `· ${scanHistory.length} scans loaded` : ''}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showDrawer && result && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDrawer(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-[48px] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
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

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}