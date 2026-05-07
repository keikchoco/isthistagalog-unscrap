'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Plus, X, Share2, Clipboard, Navigation, Store, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

// Fix for default marker icons in Leaflet with React
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface CommunityPin {
  _id: string;
  userId: string;
  userName: string;
  title: string;
  type: 'scrap' | 'drop-off' | 'exchange';
  description: string;
  location: { lat: number; lng: number };
  createdAt: string;
}

function MapEvents({ onMapClick, isAddingMode }: { onMapClick: (latlng: L.LatLng) => void, isAddingMode: boolean }) {
  useMapEvents({
    click(e) {
      if (isAddingMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function CommunityMap({ user }: { user: any }) {
  const [pins, setPins] = useState<CommunityPin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<L.LatLng | null>(null);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinDescription, setNewPinDescription] = useState('');
  const [newPinType, setNewPinType] = useState<'scrap' | 'drop-off' | 'exchange'>('scrap');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    try {
      const res = await fetch('/api/pins');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPins(data);
      }
    } catch (err) {
      console.error("Fetch pins error:", err);
    }
  };

  const filteredPins = pins.filter(pin => {
    const matchesSearch = pin.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleMapClick = (latlng: L.LatLng) => {
    setClickedLocation(latlng);
  };

  const handleAddPin = async () => {
    if (!newPinTitle || !clickedLocation) return;

    try {
      const res = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'anonymous',
          userName: user?.name || user?.displayName || 'User',
          title: newPinTitle,
          type: newPinType,
          description: newPinDescription || 'Shared via Unscrap community',
          location: { lat: clickedLocation.lat, lng: clickedLocation.lng },
        })
      });

      if (res.ok) {
        setIsAddingMode(false);
        setClickedLocation(null);
        setNewPinTitle('');
        setNewPinDescription('');
        fetchPins();
      }
    } catch (error) {
      console.error("Error adding pin:", error);
    }
  };

  const handleShare = async (pin: CommunityPin) => {
    const text = `Check out this ${pin.type} site on Unscrap: ${pin.title}`;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Unscrap Pin', text, url });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      setCopiedId(pin._id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getIcon = (type: string) => {
    let color = '#4A7A22';
    if (type === 'drop-off') color = '#8B6F47';
    if (type === 'exchange') color = '#5C4033';

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${type === 'scrap' ? '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 4h-2c-2 10-13.5 14-8 14Z"/><path d="M19 9.1C19 14 15 17 9 17L11 20Z"/>' : type === 'drop-off' ? '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' : '<path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9l2.44-4.87A2 2 0 0 1 7.22 3h9.56a2 2 0 0 1 1.78 1.13L21 9"/>'}</svg>
             </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="flex-1 relative flex flex-col min-h-[600px] rounded-[48px] overflow-hidden border border-bark/10 bg-surface shadow-2xl">
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="glass-panel mx-auto py-3 px-6 max-w-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-sprout rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-moss" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Community Challenge</p>
              <h4 className="font-bold text-sm text-ink">Restore 10,000kg of Matter</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-moss font-mono">82%</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-24 left-6 z-[1000] flex flex-col gap-4 max-w-sm w-full">
        <div className="bg-surface/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-bark/10 flex items-center gap-3 px-4">
          <Search className="w-4 h-4 text-muted" />
          <input 
            className="flex-1 bg-transparent text-sm font-bold border-none focus:ring-0 placeholder:text-moss/40 text-ink"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search hubs..."
          />
        </div>

        <button 
          onClick={() => {
            setIsAddingMode(!isAddingMode);
            setClickedLocation(null);
          }}
          className={`px-6 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 shadow-xl transition-all ${isAddingMode ? 'bg-red-500 text-white' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(92,64,51,0.2)]'}`}
        >
          {isAddingMode ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAddingMode ? 'Cancel' : 'Share Resource'}
        </button>
      </div>

      <MapContainer 
        center={[14.5995, 120.9842]} 
        zoom={11} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={handleMapClick} isAddingMode={isAddingMode} />
        
        {filteredPins.map(pin => (
          <Marker 
            key={pin._id} 
            position={[pin.location.lat, pin.location.lng]}
            icon={getIcon(pin.type)}
          >
            <Popup>
              <div className="p-4 min-w-[240px] space-y-4 bg-surface text-ink font-sans">
                <div className="flex items-center justify-between gap-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    pin.type === 'scrap' ? 'bg-moss/10 text-moss' : 
                    pin.type === 'drop-off' ? 'bg-bark/10 text-bark' : 
                    'bg-primary/5 text-primary'
                  }`}>
                    {pin.type === 'scrap' ? 'Resource Site' : pin.type === 'drop-off' ? 'Collection Hub' : 'Exchange Point'}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-bold text-ink text-lg tracking-tight mb-1 leading-tight">{pin.title}</h4>
                  <p className="text-xs text-bark leading-relaxed">"{pin.description}"</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pin.location.lat},${pin.location.lng}`)}
                    className="flex-1 bg-primary text-white py-2 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-bark transition-all shadow-sm"
                  >
                    <MapPin className="w-3 h-3" /> Directions
                  </button>
                  <button 
                    onClick={() => handleShare(pin)}
                    className="w-10 h-8 bg-sprout/10 text-muted rounded-lg flex items-center justify-center hover:text-moss transition-colors"
                  >
                    {copiedId === pin._id ? <Clipboard className="w-3.5 h-3.5 text-moss" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {isAddingMode && clickedLocation && (
          <Marker position={clickedLocation}>
            <Popup position={clickedLocation} offset={[0, -10]}>
              <div className="bg-surface p-4 rounded-xl shadow-2xl border border-bark/10 w-60 font-sans text-ink">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">Place a Pin</p>
                <input 
                  placeholder="What are you sharing?"
                  className="w-full text-xs font-bold bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none focus:border-moss mb-2"
                  value={newPinTitle}
                  onChange={e => setNewPinTitle(e.target.value)}
                  autoFocus
                />
                <textarea 
                  placeholder="Brief description..."
                  className="w-full text-xs font-medium bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none focus:border-moss mb-2 resize-none h-16 text-ink"
                  value={newPinDescription}
                  onChange={e => setNewPinDescription(e.target.value)}
                />
                <select 
                  className="w-full text-[10px] font-bold bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none mb-3 text-ink"
                  value={newPinType}
                  onChange={e => setNewPinType(e.target.value as any)}
                >
                  <option value="scrap">Organic Scrap</option>
                  <option value="drop-off">Drop-off Point</option>
                  <option value="exchange">Resource Exchange</option>
                </select>
                <button 
                  onClick={handleAddPin}
                  className="w-full bg-primary text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  Create Community Pin
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {isAddingMode && !clickedLocation && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center z-[1001]">
          <div className="bg-surface/90 backdrop-blur px-6 py-3 rounded-2xl shadow-2xl border border-bark/10 animate-pulse">
            <p className="text-xs font-black text-ink uppercase tracking-widest">Click on the map to drop a pin</p>
          </div>
        </div>
      )}
    </div>
  );
}
