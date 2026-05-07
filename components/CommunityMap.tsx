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
import { MapPin, Search, Plus, X, Share2, Clipboard, Leaf, Pencil } from 'lucide-react';
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

function MapEvents({ onMapClick, isInteractiveMode }: { onMapClick: (latlng: L.LatLng) => void, isInteractiveMode: boolean }) {
  useMapEvents({
    click(e) {
      if (isInteractiveMode) {
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
  const [newPinType] = useState<'scrap' | 'drop-off' | 'exchange'>('drop-off');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editPinTitle, setEditPinTitle] = useState('');
  const [editPinDescription, setEditPinDescription] = useState('');
  const [isEditingLocationMode, setIsEditingLocationMode] = useState(false);

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
    if (isAddingMode) {
      setClickedLocation(latlng);
      return;
    }

    if (editingPinId && isEditingLocationMode) {
      setClickedLocation(latlng);
      setIsEditingLocationMode(false);
    }
  };

  const handleAddPin = async () => {
    setErrorMessage(null);
    if (!user?.email) {
      setErrorMessage('Please sign in to create a hub point.');
      return;
    }
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
      } else {
        const payload = await res.json().catch(() => ({}));
        setErrorMessage(payload?.error || 'Could not create hub point.');
      }
    } catch (error) {
      console.error("Error adding pin:", error);
      setErrorMessage('Could not create hub point. Please try again.');
    }
  };

  const handleStartEdit = (pin: CommunityPin) => {
    if (!user?.email || pin.userId !== user.email) return;
    setErrorMessage(null);
    setIsAddingMode(false);
    setEditingPinId(pin._id);
    setEditPinTitle(pin.title);
    setEditPinDescription(pin.description || '');
    setClickedLocation(L.latLng(pin.location.lat, pin.location.lng));
    setIsEditingLocationMode(false);
  };

  const handleSaveEdit = async () => {
    setErrorMessage(null);
    if (!editingPinId || !user?.email) {
      setErrorMessage('Missing pin details for update.');
      return;
    }
    if (!editPinTitle.trim()) {
      setErrorMessage('Hub name is required.');
      return;
    }

    const original = pins.find((pin) => pin._id === editingPinId);
    const location = clickedLocation
      ? { lat: clickedLocation.lat, lng: clickedLocation.lng }
      : original?.location;

    if (!location) {
      setErrorMessage('Pin location is required.');
      return;
    }

    try {
      const res = await fetch('/api/pins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPinId,
          userId: user.email,
          title: editPinTitle,
          description: editPinDescription,
          location,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setErrorMessage(payload?.error || 'Could not update hub point.');
        return;
      }

      setEditingPinId(null);
      setEditPinTitle('');
      setEditPinDescription('');
      setClickedLocation(null);
      setIsEditingLocationMode(false);
      await fetchPins();
    } catch (error) {
      console.error('Error updating pin:', error);
      setErrorMessage('Could not update hub point. Please try again.');
    }
  };

  const hasCurrentUserHub = Boolean(user?.email && pins.some((pin) => pin.userId === user.email));

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

  const openOsmDirections = (pin: CommunityPin) => {
    // OSM directions with destination coordinates in lat,lng order.
    const destination = `${pin.location.lat},${pin.location.lng}`;
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getIcon = (type: string) => {
    let color = '#4A7A22';
    if (type === 'drop-off') color = '#DC2626';
    if (type === 'exchange') color = '#5C4033';

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${type === 'scrap' ? '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 4h-2c-2 10-13.5 14-8 14Z"/><path d="M19 9.1C19 14 15 17 9 17L11 20Z"/>' : type === 'drop-off' ? '<path d="M12 22s8-4.5 8-11a8 8 0 1 0-16 0c0 6.5 8 11 8 11z"/><circle cx="12" cy="11" r="3"/>' : '<path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9l2.44-4.87A2 2 0 0 1 7.22 3h9.56a2 2 0 0 1 1.78 1.13L21 9"/>'}</svg>
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
            setErrorMessage(null);
            setIsAddingMode(!isAddingMode);
            setClickedLocation(null);
          }}
          disabled={!user?.email || hasCurrentUserHub}
          className={`px-6 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 shadow-xl transition-all ${isAddingMode ? 'bg-red-500 text-white' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(92,64,51,0.2)]'}`}
        >
          {isAddingMode ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAddingMode ? 'Cancel' : hasCurrentUserHub ? 'Hub Point Created' : 'Create Hub Point'}
        </button>

        {errorMessage && (
          <p className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-xl text-xs font-semibold">
            {errorMessage}
          </p>
        )}

        {!user?.email && (
          <p className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl text-xs font-semibold">
            Sign in to place your hub point.
          </p>
        )}

        {user?.email && hasCurrentUserHub && (
          <p className="bg-moss/10 text-moss border border-moss/20 px-3 py-2 rounded-xl text-xs font-semibold">
            You already placed your hub point. Other users can still see it.
          </p>
        )}
      </div>

      <MapContainer 
        center={[14.5995, 120.9842]} 
        zoom={11} 
        scrollWheelZoom={true} 
        className="w-full h-[600px] md:h-[680px] z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents
          onMapClick={handleMapClick}
          isInteractiveMode={isAddingMode || (Boolean(editingPinId) && isEditingLocationMode)}
        />
        
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
                    onClick={() => openOsmDirections(pin)}
                    className="flex-1 text-white py-2 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-bark transition-all shadow-sm"
                  >
                    <MapPin className="w-3 h-3" /> Directions
                  </button>
                  <button 
                    onClick={() => handleShare(pin)}
                    className="w-10 h-8 bg-sprout/10 text-muted rounded-lg flex items-center justify-center hover:text-moss transition-colors"
                  >
                    {copiedId === pin._id ? <Clipboard className="w-3.5 h-3.5 text-moss" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                  {user?.email === pin.userId && (
                    <button
                      onClick={() => handleStartEdit(pin)}
                      className="w-10 h-8 bg-sprout/10 text-muted rounded-lg flex items-center justify-center hover:text-moss transition-colors"
                      aria-label="Edit hub point"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {isAddingMode && clickedLocation && <Marker position={clickedLocation} />}
        {editingPinId && clickedLocation && <Marker position={clickedLocation} icon={getIcon('drop-off')} />}
      </MapContainer>

      {isAddingMode && clickedLocation && (
        <div className="absolute top-24 right-6 z-[1002] w-[300px] bg-surface/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-bark/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Place Hub Point</p>
          <p className="text-[10px] font-semibold text-muted mb-3">
            Selected: {clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}
          </p>
          <input
            placeholder="Hub name"
            className="w-full text-xs font-bold bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none focus:border-moss mb-2"
            value={newPinTitle}
            onChange={e => setNewPinTitle(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="Brief description..."
            className="w-full text-xs font-medium bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none focus:border-moss mb-3 resize-none h-16 text-ink"
            value={newPinDescription}
            onChange={e => setNewPinDescription(e.target.value)}
          />
          <button
            onClick={handleAddPin}
            className="w-full bg-primary text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Save Hub Point
          </button>
        </div>
      )}

      {editingPinId && (
        <div className="absolute top-24 right-6 z-[1002] w-[300px] bg-surface/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-bark/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Edit Hub Point</p>
          {clickedLocation && (
            <p className="text-[10px] font-semibold text-muted mb-3">
              Location: {clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}
            </p>
          )}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setIsEditingLocationMode(true)}
              className="flex-1 bg-surface border border-bark/20 text-bark py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              Change Location
            </button>
            {isEditingLocationMode && (
              <button
                onClick={() => setIsEditingLocationMode(false)}
                className="flex-1 bg-surface border border-red-200 text-red-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
              >
                Cancel Move
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted mb-2">
            {isEditingLocationMode ? 'Click on the map to set the new location.' : 'Use "Change Location" to move this hub pin.'}
          </p>
          <input
            placeholder="Hub name"
            className="w-full text-xs font-bold bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none focus:border-moss mb-2"
            value={editPinTitle}
            onChange={e => setEditPinTitle(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="Brief description..."
            className="w-full text-xs font-medium bg-sprout/5 p-2 rounded-lg border border-bark/10 focus:outline-none focus:border-moss mb-3 resize-none h-16 text-ink"
            value={editPinDescription}
            onChange={e => setEditPinDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingPinId(null);
                setEditPinTitle('');
                setEditPinDescription('');
                setClickedLocation(null);
                setIsEditingLocationMode(false);
                setErrorMessage(null);
              }}
              className="flex-1 bg-surface border border-bark/20 text-bark py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

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
