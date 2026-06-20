/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email signature.');
      return;
    }

    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1200);
  };

  return (
    <footer className="bg-[#EBE7DE] pt-24 pb-12 px-6 text-[#5D5A53]">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5 mb-6">
            <img 
              src="/logo.png" 
              alt="Nami Logo" 
              className="w-7 h-7 object-contain" 
              style={{ mixBlendMode: 'multiply' }} 
            />
            <h4 className="text-2xl font-serif text-[#2C2A26]">Nami</h4>
          </div>
          <p className="max-w-xs font-light leading-relaxed">
            Designing technology that feels as natural as the world around it.
            Born from the earth, built for the mind.
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-medium text-[#2C2A26] mb-6 tracking-wide text-sm uppercase">Shop</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">All Products</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">New Arrivals</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">Audio</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">Home</a></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-medium text-[#2C2A26] mb-6 tracking-wide text-sm uppercase">Company</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">Our Story</a></li>
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">Sustainability</a></li>
            <li><a href="#journal" onClick={(e) => onLinkClick(e, 'journal')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">Journal</a></li>
            <li><a href="#orders" onClick={(e) => onLinkClick(e, 'orders')} className="hover:text-[#2C2A26] transition-colors underline-offset-4 hover:underline">Track Order</a></li>
          </ul>
        </div>

        <div className="md:col-span-4" id="newsletter-signup-column">
          <h4 className="font-medium text-[#2C2A26] mb-6 tracking-wide text-sm uppercase">Newsletter</h4>
          
          {subscribeStatus === 'success' ? (
            <div className="space-y-3 animate-fade-in-up">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#949B8E] uppercase tracking-widest bg-[#949B8E]/10 px-3 py-1.5 rounded-none">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Tuned in
              </span>
              <p className="text-sm font-serif italic text-[#2C2A26] leading-relaxed">
                "You have been successfully subscribed to Nami's seasonal journals. Peaceful releases await in your inbox."
              </p>
              <button 
                onClick={() => setSubscribeStatus('idle')}
                className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] hover:text-[#2C2A26] transition-colors mt-2"
              >
                Sign up another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <p className="text-xs font-light text-[#5D5A53] leading-relaxed max-w-sm mb-1">
                Subscribe to receive seasonal tactile portfolios, exclusive previews of new quiet assets, and journal releases.
              </p>
              
              <div className="flex flex-col gap-1.5 relative">
                <input 
                  type="text" 
                  placeholder="email@address.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={subscribeStatus === 'loading'}
                  className="bg-transparent border-b border-[#A8A29E] py-2 text-base outline-none focus:border-[#2C2A26] transition-colors placeholder-[#A8A29E]/70 text-[#2C2A26] disabled:opacity-50" 
                  aria-label="Email for newsletter"
                />
                
                {errorMessage && (
                  <span className="text-[10px] text-[#A34E36] font-mono tracking-wide mt-1 animate-fade-in-up">
                    {errorMessage}
                  </span>
                )}
              </div>

              <button 
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="self-start text-[11px] font-bold uppercase tracking-[0.2em] mt-2 text-[#2C2A26] border-b border-transparent hover:border-[#2C2A26] transition-all disabled:opacity-50 h-8 flex items-center gap-2"
              >
                {subscribeStatus === 'loading' ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-[#2C2A26] rounded-full animate-ping"></span>
                    Calibrating...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-[#D6D1C7] flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest opacity-60 gap-4">
        <p>© {new Date().getFullYear()} Nami. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
