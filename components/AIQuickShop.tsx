import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight, Loader2, Heart, Moon, Compass, Wind, Coffee, Zap } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { getAIRecommendations, AIRecommendation } from '../services/geminiService';

interface AIQuickShopProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick: (product: Product) => void;
  compareList: Product[];
  onCompareClick: (product: Product) => void;
}

const presets = [
  { label: 'Deep Focus & Productivity', query: 'find me something for focus and uninterrupted work', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  { label: 'Calm & Unwind After Hours', query: 'find me something to relax and unwind after a stressful day', icon: Coffee, color: 'text-indigo-600 bg-indigo-50' },
  { label: 'Purify & Fresh Air Space', query: 'seeking something to purify my home and bring modern freshness', icon: Wind, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Creative Sketching & Writing', query: 'spark my creative flow, journaling, and drawing thoughts', icon: Compass, color: 'text-purple-600 bg-purple-50' },
  { label: 'Peaceful Circadian Sleep', query: 'align my circadian rhythm and improve natural resting atmosphere', icon: Moon, color: 'text-blue-600 bg-blue-50' },
];

const loadingTexts = [
  'Aligning sensory materials with your intent...',
  'Interpreting acoustic & texture signatures...',
  'Harmonizing circadian wellness cycles...',
  'Reading moss bio-filtration specifications...',
  'Consulting Nami brand archives...'
];

const AIQuickShop: React.FC<AIQuickShopProps> = ({
  isOpen,
  onClose,
  onProductClick,
  compareList,
  onCompareClick
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [feedback, setFeedback] = useState<string | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<{ product: Product; reason: string }[]>([]);

  // Rotate loading texts to create delightful system awareness
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleRecommend = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    setMatchedProducts([]);
    setLoadingIndex(0);

    try {
      const result = await getAIRecommendations(searchQuery);
      setFeedback(result.conciergeFeedback);
      
      // Match ID strings in response back to actual full rich Product structures
      const matched = (result.recommendations || [])
        .map((rec: AIRecommendation) => {
          const actualProduct = PRODUCTS.find(p => p.id === rec.productId);
          return actualProduct ? { product: actualProduct, reason: rec.reason } : null;
        })
        .filter(Boolean) as { product: Product; reason: string }[];
      
      setMatchedProducts(matched);
    } catch (err: any) {
      setError(err.message || 'The concierge was unable to harmonize recommendations at this moment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetQuery: string) => {
    setQuery(presetQuery);
    handleRecommend(presetQuery);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2C2A26]/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F5F2EB] shadow-2xl border border-[#D6D1C7] text-[#2C2A26] rounded-none z-10 flex flex-col p-6 md:p-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-[#A8A29E] hover:text-[#2C2A26] hover:bg-[#EBE7DE] transition-all rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-8 pr-12">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#A8A29E] font-medium mb-2">
                <Sparkles className="w-4 h-4 text-[#A8A29E]" />
                <span>AI Quick Shop</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-serif text-[#2C2A26]">Nami Collection Align</h3>
              <p className="text-sm font-light text-[#5D5A53] mt-2 max-w-2xl leading-relaxed">
                Describe your current mood, focus target, or room environment. Our concierge will curate objects crafted to nourish your specific intent.
              </p>
            </div>

            {/* Preset alignment options */}
            <div className="mb-8">
              <span className="text-xs uppercase tracking-wider text-[#A8A29E] block mb-3 font-medium">Quick Presets</span>
              <div className="flex flex-wrap gap-3">
                {presets.map((preset, index) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(preset.query)}
                      className="flex items-center gap-2.5 px-4 py-2.5 border border-[#D6D1C7] hover:border-[#2C2A26] bg-white transition-all text-xs font-medium tracking-wide text-[#2C2A26] hover:bg-neutral-50 shadow-sm"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-4 mb-8">
              <span className="text-xs uppercase tracking-wider text-[#A8A29E] block font-medium">Custom Alignment Prompt</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRecommend(query)}
                  placeholder="e.g., 'I want some beautiful ambient lighting that helps me relax at night'"
                  className="flex-1 bg-white border border-[#D6D1C7] focus:border-[#2C2A26] px-5 py-3.5 text-sm outline-none transition-colors text-[#2C2A26] placeholder-[#A8A29E]"
                />
                <button
                  onClick={() => handleRecommend(query)}
                  disabled={loading || !query.trim()}
                  className="bg-[#2C2A26] hover:bg-[#433E38] text-[#F5F2EB] font-serif italic text-sm px-8 py-3.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Aligning...' : 'Find Match'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Content Display Area (States) */}
            <div className="flex-1 min-h-[100px] flex flex-col items-center justify-center border-t border-[#D6D1C7]/40 pt-8">
              {/* Loader */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Loader2 className="w-8 h-8 text-[#2C2A26] animate-spin mb-4" />
                  <motion.p
                    key={loadingIndex}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -5, opacity: 0 }}
                    className="text-sm italic font-serif text-[#5D5A53]"
                  >
                    {loadingTexts[loadingIndex]}
                  </motion.p>
                </motion.div>
              )}

              {/* Error state */}
              {error && (
                <div className="p-5 border border-red-200/40 bg-red-50/20 text-red-800 text-xs text-center font-mono py-8 max-w-xl">
                  {error}
                </div>
              )}

              {/* Welcome/Empty state */}
              {!loading && !feedback && !error && (
                <div className="text-center py-10 text-neutral-400 font-light flex flex-col items-center">
                  <Sparkles className="w-10 h-10 text-[#A8A29E]/40 mb-3 stroke-[1.25]" />
                  <p className="text-sm font-serif italic text-[#A8A29E]">Your mindful selection awaits calibration.</p>
                </div>
              )}

              {/* Output Results */}
              {!loading && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-6 text-left"
                >
                  {/* Concierge Introductory Feedback */}
                  <div className="p-6 bg-white/50 border-l-2 border-[#2C2A26] text-sm text-[#5D5A53] leading-relaxed italic font-serif">
                    "{feedback}"
                  </div>

                  {/* Curated Products Cards Grid inside Recommendation */}
                  {matchedProducts.length > 0 ? (
                    <div className="space-y-6">
                      <span className="text-xs uppercase tracking-wider text-[#A8A29E] font-medium block">Curated Resonance Matches</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matchedProducts.map(({ product, reason }) => (
                          <div
                            key={product.id}
                            className="bg-white border border-[#D6D1C7]/50 p-5 hover:border-[#2C2A26] transition-all flex flex-col md:flex-row gap-5 group cursor-pointer"
                            onClick={() => onProductClick(product)}
                          >
                            {/* Product preview img */}
                            <div className="w-24 h-32 md:w-28 md:h-36 bg-[#EBE7DE] overflow-hidden flex-shrink-0">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                            
                            {/* Material & Reason Context */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between">
                                  <h4 className="font-serif text-xl font-medium text-[#2C2A26] hover:text-[#5D5A53] transition-colors">
                                    {product.name}
                                  </h4>
                                  <span className="text-sm font-medium ml-2 text-[#2C2A26]">${product.price}</span>
                                </div>
                                <span className="text-[10px] text-[#A8A29E] uppercase tracking-widest font-mono block mt-0.5">
                                  {product.category}
                                </span>
                                <p className="text-xs text-[#5D5A53] font-light mt-3 leading-relaxed">
                                  {reason}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F5F2EB] text-[11px]">
                                <span className="text-[#A8A29E] group-hover:text-[#2C2A26] transition-colors flex items-center gap-1 font-serif italic">
                                  Select to align details <ArrowRight className="w-3 h-3" />
                                </span>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCompareClick(product);
                                  }}
                                  className={`text-[9px] uppercase tracking-widest font-semibold border px-2.5 py-1 ${
                                    compareList.some(p => p.id === product.id)
                                      ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]'
                                      : 'bg-transparent text-[#2C2A26] border-[#D6D1C7] hover:border-[#2C2A26]'
                                  }`}
                                >
                                  {compareList.some(p => p.id === product.id) ? 'Comparing' : 'Compare'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-[#A8A29E] italic">
                      No direct catalog items met alignment criteria. Try refining your intent parameter.
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AIQuickShop;
