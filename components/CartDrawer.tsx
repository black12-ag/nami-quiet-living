/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (index: number) => void;
  onAddToCart: (product: Product) => void; // Upgraded: we pass addToCart to permit increments
  onCheckout: (discount: number, activePromo: string) => void; // Upgraded: pass promotional parameters to checkout
}

interface GroupedItem {
  product: Product;
  quantity: number;
  originalIndices: number[];
}

const ACTIVE_COUPONS = [
  { code: 'NAMI10', desc: '10% off your serene selection', type: 'percent', val: 0.10 },
  { code: 'SERENE20', desc: '20% off high-affinity objects', type: 'percent', val: 0.20 },
  { code: 'SPRING50', desc: '$50 flat organic rebate', type: 'flat', val: 50 }
];

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemoveItem, 
  onAddToCart,
  onCheckout 
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<typeof ACTIVE_COUPONS[0] | null>(null);
  const [promoError, setPromoError] = useState('');

  // Group duplicate items to yield a proper quantity-controlled cart
  const groupedItems = useMemo(() => {
    const groups: Record<string, GroupedItem> = {};
    items.forEach((item, idx) => {
      // Group by id to separate colors as well (which get encoded in id e.g. p1-Charcoal)
      const key = item.id;
      if (!groups[key]) {
        groups[key] = {
          product: item,
          quantity: 1,
          originalIndices: [idx]
        };
      } else {
        groups[key].quantity += 1;
        groups[key].originalIndices.push(idx);
      }
    });
    return Object.values(groups);
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  
  // Free Shipping Threshold logic ($500)
  const shippingThreshold = 500;
  const isFreeShipping = subtotal >= shippingThreshold || subtotal === 0;
  const remainingForFree = shippingThreshold - subtotal;
  const shippingCost = isFreeShipping ? 0 : 15;

  // Apply promo calculation
  const discount = useMemo(() => {
    if (!activeCoupon) return 0;
    if (activeCoupon.type === 'percent') {
      return Math.round(subtotal * activeCoupon.val);
    } else {
      return Math.min(subtotal, activeCoupon.val);
    }
  }, [activeCoupon, subtotal]);

  const total = subtotal - discount + shippingCost;

  const handleApplyPromo = (code: string) => {
    const found = ACTIVE_COUPONS.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (found) {
      setActiveCoupon(found);
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Incorrect coupon code.');
    }
  };

  const handleRemovePromo = () => {
    setActiveCoupon(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#2C2A26]/30 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#F5F2EB] z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-[#D6D1C7] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D6D1C7]">
          <h2 className="text-xl font-serif text-[#2C2A26]">Your Cart ({items.length})</h2>
          <button 
            onClick={onClose} 
            className="text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {subtotal > 0 && (
          <div className="bg-[#EBE7DE]/50 px-6 py-4 border-b border-[#D6D1C7]/30 text-xs text-[#5D5A53]">
            {isFreeShipping ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#76846E] rounded-full"></span>
                <span>Congratulations! Your serene selection qualified for **Free Courier Shipping**</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between font-light">
                  <span>Add <strong className="text-[#2C2A26] font-medium">${remainingForFree}</strong> more for complimentary shipping</span>
                  <span>{Math.round((subtotal / shippingThreshold) * 100)}%</span>
                </div>
                <div className="w-full bg-[#D6D1C7]/50 h-1 rounded-none overflow-hidden">
                  <div 
                    className="bg-[#2C2A26] h-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[#A8A29E]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="font-light text-[#5D5A53]">Your cart is empty.</p>
            </div>
          ) : (
            groupedItems.map((group) => {
              const { product, quantity, originalIndices } = group;
              return (
                <div key={product.id} className="flex gap-4 animate-fade-in-up pb-6 border-b border-[#D6D1C7]/20">
                  <div className="w-20 h-24 bg-[#EBE7DE] flex-shrink-0 spill-none select-none">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                          <h3 className="font-serif text-[#2C2A26] font-medium text-sm">{product.name}</h3>
                          <span className="text-sm font-light text-[#2C2A26]">${product.price * quantity}</span>
                      </div>
                      <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest mt-1">{product.category}</p>
                    </div>

                    {/* Quantity Adjusted Area */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border border-[#D6D1C7] bg-white">
                        <button 
                          onClick={() => {
                            // Removing 1 item - remove last original index
                            onRemoveItem(originalIndices[originalIndices.length - 1]);
                          }}
                          className="px-2.5 py-1 text-xs text-[#5D5A53] hover:text-[#2C2A26] hover:bg-[#F5F2EB] transition-colors font-mono"
                        >
                          –
                        </button>
                        <span className="px-3.5 text-xs text-[#2C2A26] font-medium font-mono">{quantity}</span>
                        <button 
                          onClick={() => onAddToCart(product)}
                          className="px-2.5 py-1 text-xs text-[#5D5A53] hover:text-[#2C2A26] hover:bg-[#F5F2EB] transition-colors font-mono"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          // Remove ALL quantities (remove indices from larger to smaller)
                          const sortedIndices = [...originalIndices].sort((a, b) => b - a);
                          sortedIndices.forEach(idx => onRemoveItem(idx));
                        }}
                        className="text-[10px] uppercase tracking-wider text-[#A8A29E] hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Promo Codes & Pricing Summary */}
        {subtotal > 0 && (
          <div className="p-6 border-t border-[#D6D1C7] bg-[#EBE7DE]/30 space-y-6">
            
            {/* Promo Selector list */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#2C2A26]">Active Promos / Offer Sparks</span>
              <div className="flex flex-wrap gap-2">
                {ACTIVE_COUPONS.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleApplyPromo(c.code)}
                    disabled={activeCoupon?.code === c.code}
                    className={`text-[10px] px-2.5 py-1.5 border transition-all duration-300 font-mono tracking-wider ${
                      activeCoupon?.code === c.code 
                        ? 'border-[#76846E] bg-[#76846E]/10 text-stone-700' 
                        : 'border-[#D6D1C7] bg-white hover:border-[#2C2A26] text-[#5D5A53]'
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>

              {/* Promo input field */}
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError('');
                  }}
                  placeholder="Enter dynamic code" 
                  className="flex-1 bg-white border border-[#D6D1C7] px-3 py-2 text-xs outline-none placeholder-[#A8A29E] text-stone-700 font-mono"
                />
                <button 
                  onClick={() => handleApplyPromo(promoInput)}
                  className="bg-[#2C2A26] text-white px-4 text-xs font-medium uppercase tracking-widest hover:bg-[#433E38] transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[10px] text-red-700 font-medium">{promoError}</p>}
            </div>

            {/* Calculations Deck */}
            <div className="border-t border-[#D6D1C7]/40 pt-4 space-y-2 text-sm text-[#5D5A53]">
              <div className="flex justify-between items-center">
                <span className="font-light">Subtotal</span>
                <span>${subtotal}</span>
              </div>
              
              {activeCoupon && (
                <div className="flex justify-between items-center text-[#76846E]">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <span>Discount ({activeCoupon.code})</span>
                    <button onClick={handleRemovePromo} className="text-stone-400 hover:text-red-700 font-bold">×</button>
                  </div>
                  <span>-${discount}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="font-light">Standard Courier Delivery</span>
                <span>{shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}</span>
              </div>

              <div className="flex justify-between items-center border-t border-[#D6D1C7]/60 pt-3 text-base">
                <span className="font-serif text-[#2C2A26] font-medium">Boutique Total</span>
                <span className="font-serif text-[#2C2A26] font-semibold text-lg">${total}</span>
              </div>
            </div>

            <p className="text-[10px] text-[#A8A29E] text-center italic">Calculated and backed securely in modern sandbox framework.</p>
            
            <button 
              onClick={() => onCheckout(discount, activeCoupon?.code || '')}
              disabled={items.length === 0}
              className="w-full py-3 bg-[#2C2A26] hover:bg-[#3E4A38] text-[#F5F2EB] border border-[#2C2A26] hover:border-[#3E4A38] uppercase tracking-[0.16em] text-[10px] font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm rounded-lg"
            >
              Secure Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
