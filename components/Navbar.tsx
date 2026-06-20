/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingCart } from 'lucide-react';
import { BRAND_NAME } from '../constants';
import { motion } from 'motion/react';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onViewOrders: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onNavClick, 
  cartCount, 
  onOpenCart, 
  onViewOrders,
  searchQuery,
  onSearchChange
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Track cart additions for the bounce/shake animation
  const [animateTrigger, setAnimateTrigger] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);

  useEffect(() => {
    if (cartCount > prevCount) {
      setAnimateTrigger(true);
      const timer = setTimeout(() => setAnimateTrigger(false), 900);
      setPrevCount(cartCount);
      return () => clearTimeout(timer);
    } else if (cartCount !== prevCount) {
      setPrevCount(cartCount);
    }
  }, [cartCount, prevCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const handleCartClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setMobileMenuOpen(false);
      onOpenCart();
  }

  // Determine text color based on state
  const textColorClass = (scrolled || mobileMenuOpen) ? 'text-[#2C2A26]' : 'text-[#F5F2EB]';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
          scrolled || mobileMenuOpen ? 'bg-[#F5F2EB]/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavClick(e, ''); // Pass empty string to just reset to home
            }}
            className={`text-3xl font-serif font-medium tracking-tight z-50 relative transition-colors duration-500 ${textColorClass}`}
          >
            {BRAND_NAME}
          </a>
          
          {/* Center Links - Desktop */}
          <div className={`hidden md:flex items-center gap-12 text-sm font-medium tracking-widest uppercase transition-colors duration-500 ${textColorClass}`}>
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:opacity-60 transition-opacity">Shop</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:opacity-60 transition-opacity">About</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:opacity-60 transition-opacity">Journal</a>
            <a href="#orders" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); onViewOrders(); }} className="hover:opacity-60 transition-opacity">Orders</a>
          </div>

          {/* Right Actions */}
          <div className={`flex items-center gap-6 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            
            {/* Premium Interactive Search input (Desktop) */}
            <div className="relative hidden md:flex items-center">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`text-xs pl-8 pr-8 py-1.5 focus:w-48 w-32 rounded-full border outline-none font-sans transition-all duration-300 ${
                  scrolled || mobileMenuOpen
                    ? 'bg-[#2C2A26]/5 border-[#D6D1C7]/85 text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                    : 'bg-[#F5F2EB]/10 border-[#F5F2EB]/30 text-[#F5F2EB] placeholder-[#F5F2EB]/60 focus:border-[#F5F2EB]'
                }`}
              />
              <Search className={`absolute left-2.5 w-3.5 h-3.5 ${scrolled || mobileMenuOpen ? 'text-[#8A857B]' : 'text-[#F5F2EB]/50'}`} />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 hover:scale-110 transition-transform p-0.5"
                >
                  <X className={`w-3 h-3 ${scrolled || mobileMenuOpen ? 'text-[#2C2A26]' : 'text-[#F5F2EB]/80'}`} />
                </button>
              )}
            </div>

            <button 
              onClick={handleCartClick}
              className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity hidden sm:flex"
            >
              <motion.div
                animate={animateTrigger ? {
                  scale: [1, 1.3, 0.95, 1.15, 0.98, 1],
                  rotate: [0, -12, 12, -8, 8, 0],
                  y: [0, -4, 2, -2, 1, 0]
                } : { scale: 1, rotate: 0, y: 0 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="inline-block"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.div>
              <span>Cart ({cartCount})</span>
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className={`block md:hidden focus:outline-none transition-colors duration-500 ${textColorClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
               {mobileMenuOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                 </svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#F5F2EB] z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          {/* Mobile Search input */}
          <div className="w-full max-w-xs px-4 mb-8">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#2C2A26]/5 border border-[#D6D1C7] focus:border-[#2C2A26] pl-9 pr-9 py-2.5 text-xs tracking-wider rounded-lg outline-none text-[#2C2A26] placeholder-[#A8A29E]"
              />
              <Search className="absolute left-3 w-3.5 h-3.5 text-[#A8A29E]" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-[#A8A29E] hover:text-[#2C2A26] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-8 text-xl font-serif font-medium text-[#2C2A26]">
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:opacity-60 transition-opacity">Shop</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:opacity-60 transition-opacity">About</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:opacity-60 transition-opacity">Journal</a>
            <a href="#orders" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); onViewOrders(); }} className="hover:opacity-60 transition-opacity">Orders</a>
            <button 
              onClick={handleCartClick} 
              className="flex items-center gap-2 hover:opacity-60 transition-opacity text-base uppercase tracking-widest font-sans mt-8"
            >
              <motion.div
                animate={animateTrigger ? {
                  scale: [1, 1.3, 0.95, 1.15, 0.98, 1],
                  rotate: [0, -12, 12, -8, 8, 0],
                  y: [0, -4, 2, -2, 1, 0]
                } : { scale: 1, rotate: 0, y: 0 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="inline-block"
              >
                <ShoppingCart className="w-5 h-5 text-[#2C2A26]" />
              </motion.div>
              <span>Cart ({cartCount})</span>
            </button>
          </div>
      </div>
    </>
  );
};

export default Navbar;
