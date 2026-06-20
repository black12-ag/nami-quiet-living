/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../types';
import { X, ArrowRight, TableProperties } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompareBarProps {
  compareList: Product[];
  onRemoveFromCompare: (product: Product) => void;
  onClearCompare: () => void;
  onOpenCompareModal: () => void;
}

const CompareBar: React.FC<CompareBarProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onOpenCompareModal,
}) => {
  if (compareList.length === 0) return null;

  const totalSlots = [0, 1, 2];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto max-w-2xl bg-[#2C2A26] text-[#F5F2EB] border border-stone-800 rounded-2xl shadow-[0_20px_50px_rgba(40,36,32,0.45)] p-4 sm:px-6 flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        {/* Left indicators & slots */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="text-left shrink-0">
            <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 block">
              Active Session
            </span>
            <span className="text-sm font-serif font-medium text-stone-100">
              Comparing ({compareList.length}/3)
            </span>
          </div>

          <div className="h-8 w-[1px] bg-stone-700 hidden sm:block"></div>

          {/* Slots */}
          <div className="flex gap-2.5">
            {totalSlots.map((index) => {
              const product = compareList[index];

              if (product) {
                return (
                  <div
                    key={product.id}
                    className="relative w-12 h-12 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 group"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => onRemoveFromCompare(product)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-stone-100 text-[#2C2A26] rounded-full border border-stone-800 hover:bg-[#A34E36] hover:text-white transition-all shadow cursor-pointer scale-90 group-hover:scale-100"
                      title="Remove object"
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={`empty-${index}`}
                  className="w-12 h-12 rounded-lg border border-dashed border-stone-700/60 flex items-center justify-center text-stone-500 shrink-0 select-none text-[10px] font-mono"
                  title="Empty resonance slot"
                >
                  +
                </div>
              );
            })}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onClearCompare}
            className="text-[10px] text-stone-400 hover:text-stone-100 uppercase tracking-widest font-mono font-medium transition-colors p-2 cursor-pointer"
          >
            Clear
          </button>
          
          <button
            onClick={onOpenCompareModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#2C2A26] text-xs font-semibold uppercase tracking-widest font-mono rounded-lg transition-all cursor-pointer shadow-md shadow-black/10 hover:scale-[1.02]"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Compare Now</span>
            <ArrowRight className="w-3 h-3 text-stone-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareBar;
