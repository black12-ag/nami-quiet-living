/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onCompareClick?: (product: Product) => void;
  isCompared?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onCompareClick, isCompared }) => {
  return (
    <div 
      className="group flex flex-col gap-6 cursor-pointer p-4 bg-transparent hover:bg-white/60 border border-transparent hover:border-[#D6D1C7]/45 rounded-xl transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(44,42,38,0.04)] relative" 
      id={`product-card-${product.id}`} 
      onClick={() => onClick(product)}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#EBE7DE]">
        {/* Stock status badge */}
        {product.inventoryCount !== undefined && (
          <div className="absolute top-4 left-4 z-10 transition-transform duration-300 group-hover:scale-105">
            <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-semibold ${
              product.inventoryCount <= 5 
                ? 'bg-[#A34E36] text-[#F5F2EB]' 
                : 'bg-[#E3DFD5]/90 backdrop-blur-sm text-[#2C2A26]'
            }`}>
              {product.inventoryCount <= 5 ? `Low Stock (${product.inventoryCount} left)` : 'In Stock'}
            </span>
          </div>
        )}

        {/* Compare button */}
        {onCompareClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompareClick(product);
            }}
            className={`absolute top-4 right-4 z-20 px-2.5 py-1 text-[9px] uppercase tracking-widest font-semibold font-mono rounded transition-all duration-300 border backdrop-blur-sm ${
              isCompared
                ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]'
                : 'bg-white/90 hover:bg-[#2C2A26] hover:text-[#F5F2EB] text-[#2C2A26] border-[#D6D1C7]'
            }`}
            id={`compare-btn-${product.id}`}
            title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
          >
            {isCompared ? 'Comparing' : 'Compare'}
          </button>
        )}

        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110 sepia-[0.1]"
        />
        
        {/* Hover overlay with "Quick View" - minimalistic */}
        <div className="absolute inset-0 bg-[#2C2A26]/0 group-hover:bg-[#2C2A26]/5 transition-colors duration-500 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="bg-white/90 backdrop-blur text-[#2C2A26] px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium">
                    View Details
                </span>
            </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-serif font-medium text-[#2C2A26] mb-1 group-hover:opacity-70 transition-opacity">{product.name}</h3>
        <p className="text-sm font-light text-[#5D5A53] mb-3 tracking-wide">{product.category}</p>
        <span className="text-sm font-medium text-[#2C2A26] block">${product.price}</span>
      </div>
    </div>
  );
};

export default ProductCard;
