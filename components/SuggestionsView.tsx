'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Sparkles, ChefHat, Leaf, RefreshCw, Star, Package, Sparkle } from 'lucide-react';

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
  timestamp: any;
}

interface SuggestionsViewProps {
  history: ScanItem[];
}

export default function SuggestionsView({ history }: SuggestionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  const knownItems = [
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
              className="bg-surface border border-bark/10 rounded-3xl p-8 relative overflow-hidden group shadow-sm"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <ChefHat className="w-16 h-16 text-ink" />
              </div>
              <p className="text-sm text-bark leading-relaxed font-medium relative z-10 italic">"{tip}"</p>
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
                className="bg-surface border border-bark/10 rounded-3xl aspect-[3/4] flex flex-col justify-between p-6 shadow-sm group hover:border-moss/40 transition-all"
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
                    <div className="w-16 h-16">
                      {knownItems.find(k => k.name.toLowerCase() === scan.item?.toLowerCase())?.icon || <Package className="w-full h-full" />}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h5 className="text-sm font-bold text-ink truncate px-2">{scan.item || 'Discovery'}</h5>
                    <div className="flex justify-center gap-1">
                        <span className="text-[10px] font-bold text-moss uppercase tracking-wider">+{scan?.xp_reward || 10} XP</span>
                    </div>
                  </div>
              </motion.div>
            ))}

            {knownItems.filter(k => !historyItems.includes(k.name.toLowerCase()) && (rarityFilter === 'All' || k.rarity === rarityFilter)).map((item) => (
                <motion.div
                    key={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-sprout/5 border border-dashed border-bark/20 rounded-3xl aspect-[3/4] flex flex-col items-center justify-center gap-4 opacity-40 group"
                >
                    <div className="w-20 h-20 bg-surface border border-bark/10 rounded-full flex items-center justify-center text-sprout">
                        <div className="w-10 h-10">{item.icon}</div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.rarity}</p>
                        <p className="text-sm font-bold text-muted tracking-tight">Undiscovered</p>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
