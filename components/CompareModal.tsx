/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { X, ShoppingCart, Plus, Minimize2, Eye, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Product[];
  onRemoveFromCompare: (product: Product) => void;
  onAddToCompare: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareList,
  onRemoveFromCompare,
  onAddToCompare,
  onAddToCart,
  onViewProduct,
}) => {
  const [showAddMenuIndex, setShowAddMenuIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // The remaining products that can be added to compare
  const availableToCompare = PRODUCTS.filter(
    (p) => !compareList.some((comp) => comp.id === p.id)
  );

  const totalSlots = [0, 1, 2];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2A26]/40 backdrop-blur-sm">
        {/* Animated backdrop closer */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-6xl bg-[#F5F2EB] border border-[#D6D1C7] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#D6D1C7]/60 flex justify-between items-center bg-[#EBE7DE]">
            <div className="flex items-center gap-3">
              <span className="p-1 px-2.5 bg-[#2C2A26] text-[#F5F2EB] rounded text-[10px] font-mono tracking-widest font-bold uppercase">
                Nami Resonance comparison
              </span>
              <h2 className="text-xl font-serif text-[#2C2A26] font-medium hidden sm:block">
                Compare Objects ({compareList.length}/3)
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200/60 text-[#2C2A26] transition-colors cursor-pointer"
              aria-label="Close modal"
              id="compare-modal-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table / Side-by-side grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
            {compareList.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-sm text-[#5D5A53] italic font-serif">
                  Select and add items from the collection to view their alignment details.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#2C2A26] text-[#F5F2EB] text-xs uppercase tracking-widest font-mono rounded hover:bg-[#433E38] transition-colors"
                >
                  Browse Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {totalSlots.map((index) => {
                  const product = compareList[index];

                  if (product) {
                    return (
                      <div
                        key={product.id}
                        className="bg-white/50 border border-[#D6D1C7]/50 rounded-xl p-5 flex flex-col relative transition-shadow hover:shadow-sm"
                        id={`compare-slot-${product.id}`}
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveFromCompare(product)}
                          className="absolute top-3 right-3 z-10 p-1 bg-[#F5F2EB] hover:bg-[#A34E36] hover:text-[#F5F2EB] border border-[#D6D1C7]/60 rounded-full text-[#2C2A26] transition-all cursor-pointer shadow-sm"
                          title="Remove object from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Image banner */}
                        <div className="aspect-[4/3] w-full bg-[#EBE7DE] rounded-lg overflow-hidden relative mb-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#2C2A26]/85 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-mono rounded">
                            {product.category}
                          </span>
                        </div>

                        {/* Details specs */}
                        <div className="space-y-4 flex-1">
                          <div className="space-y-1 text-left">
                            <h3 className="font-serif text-xl font-semibold text-[#2C2A26]">
                              {product.name}
                            </h3>
                            <p className="text-xs text-[#A8A29E] font-medium font-mono uppercase tracking-wider">
                              {product.tagline}
                            </p>
                            <span className="block text-lg font-mono font-bold text-[#2C2A26] pt-1">
                              ${product.price}
                            </span>
                          </div>

                          <div className="h-[1px] bg-[#D6D1C7]/50" />

                          {/* Description snippet */}
                          <div className="space-y-1.5 text-left">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] font-mono">
                              Sensory Concept
                            </h4>
                            <p className="text-xs text-[#5D5A53] leading-relaxed font-light line-clamp-4">
                              {product.description}
                            </p>
                          </div>

                          <div className="h-[1px] bg-[#D6D1C7]/50" />

                          {/* Features specifications */}
                          <div className="space-y-2 text-left">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] font-mono">
                              Spec Highlights
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {product.features.map((feature, featureIdx) => (
                                <span
                                  key={featureIdx}
                                  className="text-[10px] font-medium font-mono text-[#2C2A26] px-2.5 py-0.5 bg-[#76846E]/10 border border-[#76846E]/20 rounded-full"
                                >
                                  • {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="h-[1px] bg-[#D6D1C7]/50" />

                          {/* Stock Inventory */}
                          <div className="flex items-center justify-between text-xs text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] font-mono">
                              Availability
                            </span>
                            {product.inventoryCount !== undefined ? (
                              <span
                                className={`font-mono text-[10px] uppercase tracking-wide font-semibold ${
                                  product.inventoryCount <= 5
                                    ? 'text-[#A34E36]'
                                    : 'text-[#76846E]'
                                }`}
                              >
                                {product.inventoryCount <= 5
                                  ? `Low Stock (${product.inventoryCount} left)`
                                  : 'Fully Grounded (In Stock)'}
                              </span>
                            ) : (
                              <span className="text-stone-500 font-mono">Available</span>
                            )}
                          </div>
                        </div>

                        {/* Actions of each column */}
                        <div className="mt-6 pt-4 border-t border-[#D6D1C7]/40 flex gap-2.5">
                          <button
                            onClick={() => {
                              onViewProduct(product);
                              onClose();
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#D6D1C7] hover:border-[#2C2A26] bg-white text-[#2C2A26] text-[10px] uppercase tracking-widest font-medium rounded transition-colors cursor-pointer"
                            title="See full sensory parameters"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          
                          <button
                            onClick={() => onAddToCart(product)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2C2A26] hover:bg-[#433E38] text-[#F5F2EB] text-[10px] uppercase tracking-widest font-medium rounded transition-colors cursor-pointer"
                            title="Integrate into logs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot Picker
                  return (
                    <div
                      key={`empty-${index}`}
                      className="border-2 border-dashed border-[#D6D1C7]/80 rounded-xl p-8 flex flex-col justify-center items-center text-center bg-stone-500/5 min-h-[400px] relative"
                    >
                      <Plus className="w-8 h-8 text-[#A8A29E] mb-3 stroke-[1.5]" />
                      <h3 className="font-serif text-lg text-[#2C2A26] mb-1 font-medium">
                        Empty Resonance Slot
                      </h3>
                      <p className="text-xs text-[#A8A29E] max-w-[200px] leading-relaxed mb-6">
                        Add another object from the system to contrast physical specifications.
                      </p>

                      {showAddMenuIndex === index ? (
                        <div className="absolute inset-0 bg-[#F5F2EB] z-20 rounded-xl p-4 flex flex-col text-left overflow-y-auto">
                          <div className="flex justify-between items-center pb-2.5 border-b border-[#D6D1C7] mb-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#2C2A26]">
                              Select Resonance Vector
                            </span>
                            <button
                              onClick={() => setShowAddMenuIndex(null)}
                              className="p-1 hover:bg-stone-200 text-[#2C2A26] rounded-full"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {availableToCompare.length === 0 ? (
                            <p className="text-xs text-[#A8A29E] text-center my-auto italic">
                              No alternative objects available.
                            </p>
                          ) : (
                            <div className="space-y-2 flex-1">
                              {availableToCompare.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    onAddToCompare(p);
                                    setShowAddMenuIndex(null);
                                  }}
                                  className="w-full flex gap-3 text-left p-2 hover:bg-white/80 border border-[#D6D1C7]/40 rounded-lg group transition-colors"
                                >
                                  <div className="w-12 h-12 bg-white rounded overflow-hidden shrink-0">
                                    <img
                                      src={p.imageUrl}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-xs font-medium text-[#2C2A26] truncate group-hover:underline">
                                      {p.name}
                                    </h4>
                                    <p className="text-[10px] text-[#A8A29E] font-mono">
                                      ${p.price} • {p.category}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddMenuIndex(index)}
                          className="px-4 py-2 bg-white hover:bg-[#2C2A26] hover:text-[#F5F2EB] border border-[#D6D1C7] text-[#2C2A26] text-xs uppercase tracking-widest font-mono font-medium transition-all shadow-sm rounded cursor-pointer"
                        >
                          Select Object
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom helper */}
          {compareList.length > 0 && (
            <div className="px-6 py-4 bg-[#EBE7DE]/40 border-t border-[#D6D1C7]/60 flex justify-between items-center text-xs font-mono text-[#5D5A53]">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span>Selected vectors sync with your local active browser session.</span>
              </div>
              <button
                onClick={onClose}
                className="hover:underline hover:text-[#2C2A26] uppercase text-[10px] tracking-widest font-semibold"
              >
                Return to Shop
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompareModal;
