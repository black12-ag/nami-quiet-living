/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import ProductCard from './ProductCard';
import AIQuickShop from './AIQuickShop';

const categories = ['All', 'Audio', 'Wearable', 'Mobile', 'Home'];

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 border border-[#D6D1C7]/30 rounded-xl bg-white/10 animate-pulse">
      <div className="relative w-full aspect-[4/5] bg-[#E3DFD5] rounded-lg overflow-hidden flex items-center justify-center">
        {/* Shimmer line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5F2EB]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        {/* Soft geometric abstract focus placeholder */}
        <div className="w-16 h-16 rounded-full border border-[#D6D1C7]/30 opacity-40"></div>
      </div>
      
      <div className="text-center space-y-3 mt-2 flex flex-col items-center">
        {/* Title loader */}
        <div className="h-6 w-2/3 bg-[#E3DFD5] rounded-sm" />
        {/* Category loader */}
        <div className="h-3 w-1/3 bg-[#E3DFD5]/60 rounded-sm" />
        {/* Price loader */}
        <div className="h-4 w-1/5 bg-[#E3DFD5]/80 rounded-sm" />
      </div>
    </div>
  );
};

interface ProductGridProps {
  onProductClick: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  compareList: Product[];
  onCompareClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  onProductClick, 
  searchQuery, 
  onSearchChange,
  compareList,
  onCompareClick
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-low', 'price-high', 'name-asc'
  const [isLoading, setIsLoading] = useState(true);
  const [isAIQuickShopOpen, setIsAIQuickShopOpen] = useState(false);

  // Trigger loading screen pulse on configuration or index shift
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, sortBy]);

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Search query matching
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) || 
             p.tagline.toLowerCase().includes(query) ||
             p.description.toLowerCase().includes(query) ||
             p.category.toLowerCase().includes(query)
      );
    }

    // Sort matching
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <section id="products" className="py-24 px-6 md:px-12 bg-[#F5F2EB]">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-16 space-y-8">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26]">The Collection</h2>
            <button
              onClick={() => setIsAIQuickShopOpen(true)}
              className="flex items-center gap-2.5 bg-[#2C2A26] hover:bg-[#433E38] text-[#F5F2EB] px-6 py-3 border border-[#D6D1C7] transition-all duration-300 active:scale-95 text-xs uppercase tracking-widest font-medium animate-pulse"
              id="ai-quick-shop-trigger"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>✨ AI Quick Shop</span>
            </button>
          </div>
          
          {/* Controls Bar: Categories & Search/Sort */}
          <div className="w-full max-w-5xl space-y-6">
            
            {/* Elegant Horizontal Category Scroller */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-4 border-t border-[#D6D1C7]/50 w-full mb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs uppercase tracking-widest pb-1 border-b transition-all duration-300 font-medium ${
                    activeCategory === cat 
                      ? 'border-[#2C2A26] text-[#2C2A26]' 
                      : 'border-transparent text-[#A8A29E] hover:text-[#2C2A26]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filtering and Sort Subpanel */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-b border-[#D6D1C7]/30 pb-4">
              
              {/* Minimal Search Input */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search catalogue..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-white/40 border border-[#D6D1C7] focus:border-[#2C2A26] pl-10 pr-4 py-2.5 text-sm rounded-none outline-none transition-colors text-[#2C2A26] placeholder-[#A8A29E]"
                />
                <svg
                  className="absolute left-3.5 top-3 w-4 h-4 text-[#A8A29E]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-3 text-[#A8A29E] hover:text-[#2C2A26] text-xs transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Counter and Sort Dropdown */}
              <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-6 text-sm text-[#5D5A53]">
                <span className="font-light">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                </span>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#A8A29E]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-b border-[#D6D1C7] text-sm text-[#2C2A26] py-1 pl-1 pr-4 focus:border-[#2C2A26] outline-none cursor-pointer"
                  >
                    <option value="default">Resonance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Alphabetical (A–Z)</option>
                  </select>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Large Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
            {Array.from({ length: Math.max(3, filteredProducts.length || 6) }).map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={onProductClick} 
                onCompareClick={onCompareClick}
                isCompared={compareList.some(p => p.id === product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <svg
              className="w-12 h-12 text-[#A8A29E] stroke-[1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            <p className="text-base text-[#5D5A53] font-light">
              No objects found matching current parameters. Try adjusting filters.
            </p>
          </div>
        )}
      </div>

      <AIQuickShop 
        isOpen={isAIQuickShopOpen} 
        onClose={() => setIsAIQuickShopOpen(false)} 
        onProductClick={onProductClick}
        compareList={compareList}
        onCompareClick={onCompareClick}
      />
    </section>
  );
};

export default ProductGrid;
