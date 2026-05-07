'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Sparkles, ChefHat, Leaf, RefreshCw, Star, Package, Sparkle, X, ChevronRight } from 'lucide-react';

interface ScanItem {
  _id: string;
  item: string;
  category: string;
  rarity: 'Everyday' | 'Reusable' | 'Recyclable' | 'Rare Resource' | 'Raw';
  suggestions: any[];
  co2_diverted_grams: number;
  peso_saved: number;
  xp_reward: number;
  safe_to_use: boolean;
  imageUrl?: string;
  timestamp: any;
}

interface SuggestionsViewProps {
  history: ScanItem[];
}

export default function SuggestionsView({ history }: SuggestionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  const knownItems: Array<{ name: string; rarity: string; icon: React.ReactElement; imageUrl?: string }> = [
    { name: "Banana Peel", rarity: "Everyday", icon: <Package className="w-full h-full" /> },
    { name: "Coffee Grounds", rarity: "Everyday", icon: <Package className="w-full h-full" /> },
    { name: "Eggshells", rarity: "Everyday", icon: <Package className="w-full h-full" /> },
    { name: "Orange Peel", rarity: "Everyday", icon: <Package className="w-full h-full" /> },
    { name: "Apple Core", rarity: "Everyday", icon: <Package className="w-full h-full" /> },
    { name: "Avocado Pit", rarity: "Reusable", icon: <Leaf className="w-full h-full" /> },
    { name: "Expired Milk", rarity: "Recyclable", icon: <RefreshCw className="w-full h-full" /> },
    { name: "Watermelon Rind", rarity: "Reusable", icon: <Leaf className="w-full h-full" /> },
    { name: "Onion Skins", rarity: "Rare Resource", icon: <Sparkle className="w-full h-full" /> },
    { name: "Pineapple Crown", rarity: "Raw", icon: <Star className="w-full h-full" /> },
  ];

  const historyItems = history.map(h => (h.item || '').toLowerCase());

  const selectedItemHistory = useMemo(() => {
    if (!selectedItemName) return [] as ScanItem[];
    return history.filter((scan) => (scan.item || '').toLowerCase() === selectedItemName.toLowerCase());
  }, [history, selectedItemName]);

  const selectedItemSuggestions = useMemo(() => {
    const allSuggestions = selectedItemHistory.flatMap((scan) => scan.suggestions || []);
    const unique = new Map<string, any>();

    allSuggestions.forEach((suggestion) => {
      const key = `${suggestion?.title || ''}-${suggestion?.description || ''}-${suggestion?.type || ''}`;
      if (!unique.has(key)) {
        unique.set(key, suggestion);
      }
    });

    return Array.from(unique.values());
  }, [selectedItemHistory]);

  const selectedKnownItem = useMemo(
    () => knownItems.find((item) => item.name.toLowerCase() === selectedItemName?.toLowerCase()) ?? null,
    [knownItems, selectedItemName],
  );
  
  const filteredHistory = history.filter(item => {
    const matchesSearch = (item.item || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === 'All' || item.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const getPersonalizedTips = () => {
    const allItems = history.map(h => h.item);
    if (allItems.length === 0) return [
      "Start your eco-journey by scanning your kitchen scraps!",
      "Tip: Banana peels are rich in potassium, great for your garden soil.",
      "Did you know? Coffee grounds make excellent natural fertilizer and deer repellent."
    ];

    const counts: Record<string, number> = {};
    allItems.forEach(i => counts[i] = (counts[i] || 0) + 1);

    const frequentItems = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2);
    
    const tips = [];
    if (frequentItems.some(([name]) => name.toLowerCase().includes('peel') || name.toLowerCase().includes('vegetable'))) {
      tips.push("Since you often have vegetable peels, why not try making homemade 'Veggie Scrap Broth'?");
    }
    if (frequentItems.some(([name]) => name.toLowerCase().includes('coffee'))) {
      tips.push("Your coffee grounds can be repurposed into a natural exfoliant. Just mix with a bit of coconut oil.");
    }
    if (frequentItems.some(([name]) => name.toLowerCase().includes('egg'))) {
      tips.push("Crushed eggshells provide a calcium boost for your tomato plants or peppers.");
    }

    if (tips.length < 3) {
      tips.push("Try scanning a Rare Resource next to see a higher 3R Lab XP reward.");
    }

    return tips;
  };

  const tips = getPersonalizedTips();

  const openItemModal = (itemName: string) => {
    setSelectedItemName(itemName);
  };

  const closeItemModal = () => {
    setSelectedItemName(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-12 bg-transparent text-ink">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-moss/10 rounded-2xl flex items-center justify-center text-moss shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-ink">Personalized Insights</h3>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Based on your activity</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tips.map((tip, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944] border border-bark/10 rounded-3xl p-8 relative overflow-hidden group shadow-sm"
            >
              {/* <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <ChefHat className="w-16 h-16 text-ink" />
              </div> */}
              <p className=" text-surface leading-relaxed relative z-10 italic font-normal">"{tip}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surface border border-bark/10 text-muted rounded-2xl flex items-center justify-center shadow-sm">
              <History className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-ink">The Bin</h3>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">Index of discovered materials</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="bg-surface border border-bark/10 rounded-2xl px-4 py-3 text-xs font-bold text-muted outline-none focus:ring-2 focus:ring-moss/10"
            >
              <option value="All">All Categories</option>
              <option value="Everyday">Everyday</option>
              <option value="Reusable">Reusable</option>
              <option value="Recyclable">Recyclable</option>
              <option value="Rare Resource">Rare Resource</option>
              <option value="Raw">Raw</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((scan) => (
              <motion.div
                layout
                key={scan._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                role="button"
                tabIndex={0}
                onClick={() => openItemModal(scan.item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openItemModal(scan.item);
                  }
                }}
                className="bg-surface border border-bark/10 rounded-3xl aspect-3/4 flex flex-col justify-between p-6 shadow-sm group hover:border-moss/40 hover:-translate-y-1 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-moss/20"
              >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-sprout uppercase tracking-wider">#{scan._id.slice(-4)}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      scan.rarity === 'Raw' ? 'bg-[#B8860B] text-white' :
                      scan.rarity === 'Rare Resource' ? 'bg-[#7B5EA7] text-white' :
                      scan.rarity === 'Recyclable' ? 'bg-[#4A6DAA] text-white' :
                      scan.rarity === 'Reusable' ? 'bg-[#4A8F6F] text-white' :
                      'bg-[#D1CBC2] text-white'
                    }`}>
                      {scan.rarity === 'Raw' ? <Star className="w-4 h-4" /> : scan.rarity === 'Rare Resource' ? <Sparkle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center p-6 text-sprout group-hover:text-moss group-hover:scale-110 transition-all duration-500">
                    <div className="size-36 overflow-hidden rounded-md">
                      {scan.imageUrl ? (
                        <img src={scan.imageUrl} alt={scan.item} className="w-full h-full object-cover" />
                      ) : (
                        (() => {
                          const known = knownItems.find(k => k.name.toLowerCase() === scan.item?.toLowerCase());
                          return known?.imageUrl ? (
                            <img src={known.imageUrl} alt={known.name} className="w-full h-full object-cover" />
                          ) : (
                            known?.icon || <Package className="w-full h-full" />
                          );
                        })()
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h5 className="text-sm font-bold text-ink truncate px-2">{scan.item || 'Discovery'}</h5>
                    <div className="flex justify-center gap-1">
                        <span className="text-[10px] font-bold text-moss uppercase tracking-wider">+{scan?.xp_reward || 10} XP</span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted flex items-center justify-center gap-1">
                      View suggestions <ChevronRight className="h-3 w-3" />
                    </p>
                  </div>
              </motion.div>
            ))}

            {knownItems.filter(k => !historyItems.includes(k.name.toLowerCase()) && (rarityFilter === 'All' || k.rarity === rarityFilter)).map((item) => (
                <motion.div
                    key={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => openItemModal(item.name)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openItemModal(item.name);
                      }
                    }}
                    className="bg-sprout/5 border border-dashed border-bark/20 rounded-3xl aspect-3/4 flex flex-col items-center justify-center gap-4 opacity-70 group cursor-pointer hover:opacity-100 hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-moss/20"
                >
                    <div className="w-20 h-20 bg-surface border border-bark/10 rounded-full flex items-center justify-center text-sprout overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-10 h-10">{item.icon}</div>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.rarity}</p>
                        <p className="text-sm font-bold text-muted tracking-tight">View suggestions</p>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selectedItemName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-150 bg-black/45 backdrop-blur-sm flex items-center justify-center px-4 py-8"
            onClick={closeItemModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-4xl border border-bark/10 bg-page-bg shadow-2xl flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 border-b border-bark/10 px-6 py-5 bg-white/80 backdrop-blur-xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted">Item suggestions</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-ink">{selectedItemName}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {selectedItemHistory.length > 0
                      ? `${selectedItemHistory.length} scan${selectedItemHistory.length === 1 ? '' : 's'} found`
                      : 'No scans yet for this item'}
                  </p>
                </div>
                <button
                  onClick={closeItemModal}
                  className="rounded-2xl border border-bark/10 bg-white p-3 text-muted transition-colors hover:text-ink"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-3xl bg-white border border-bark/10 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted">Rarity</p>
                    <p className="mt-2 text-2xl font-black text-primary">
                      {selectedItemHistory[0]?.rarity || selectedKnownItem?.rarity || 'Unknown'}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      Clicked items use the suggestions stored from your scans. If this item has been scanned before, the most relevant tips and repurposing ideas appear here.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-linear-to-br from-[#6a4938] via-[#7c5a3f] to-[#8a6944] p-5 text-[#fdf6ec]">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#efe4d2]/80">Stored scans</p>
                    <div className="mt-3 space-y-2">
                      {selectedItemHistory.length > 0 ? (
                        selectedItemHistory.map((scan) => (
                          <div key={scan._id} className="rounded-2xl bg-white/10 px-4 py-3">
                            <p className="text-sm font-bold">{scan.category || 'General'}</p>
                            <p className="text-xs text-[#fdf6ec]/75">
                              +{scan.xp_reward || 0} XP · ₱{(scan.peso_saved || 0).toFixed(2)} saved
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-relaxed text-[#fdf6ec]/85">
                          Scan this item to unlock tailored suggestions, compost ideas, and reuse tips.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted">Suggestions</p>
                      <h4 className="mt-2 text-xl font-black tracking-tight text-ink">Ways to reuse this item</h4>
                    </div>
                  </div>

                  {selectedItemSuggestions.length > 0 ? (
                    <div className="grid gap-3">
                      {selectedItemSuggestions.map((suggestion, index) => (
                        <div key={`${suggestion?.title || 'suggestion'}-${index}`} className="rounded-3xl border border-bark/10 bg-white p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-black uppercase tracking-[0.25em] text-moss">
                                {suggestion?.type || 'other'}
                              </p>
                              <h5 className="mt-2 text-lg font-bold text-ink">{suggestion?.title || 'Suggestion'}</h5>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-muted">
                            {suggestion?.description || 'No description available.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-bark/20 bg-surface p-6 text-sm text-muted">
                      No stored suggestions yet for this item. Scan it to generate reuse ideas.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
