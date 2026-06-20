/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order } from '../types';

interface CheckoutProps {
  items: Product[];
  onBack: () => void;
  initialDiscount?: number;
  initialPromoCode?: string;
  onClearCart?: () => void; // Upgraded: Clean cart upon successful placement
  onOrderCreated?: (order: Order) => void;
  initialPrefill?: { email?: string; firstName?: string; lastName?: string; address?: string; city?: string; postalCode?: string };
}

const ACTIVE_COUPONS = [
  { code: 'NAMI10', val: 0.10, type: 'percent' },
  { code: 'SERENE20', val: 0.20, type: 'percent' },
  { code: 'SPRING50', val: 50, type: 'flat' }
];

const Checkout: React.FC<CheckoutProps> = ({ 
  items, 
  onBack, 
  initialDiscount = 0, 
  initialPromoCode = '', 
  onClearCart,
  onOrderCreated,
  initialPrefill
}) => {
  // Funnel steps: 1 = Shipping, 2 = Payment & Courier, 3 = Loading clearance, 4 = Success dashboard
  const [step, setStep] = useState(1);
  const [loadingText, setLoadingText] = useState('Initiating cryptographic clearance...');
  
  // Delivery State
  const [email, setEmail] = useState(initialPrefill?.email || '');
  const [firstName, setFirstName] = useState(initialPrefill?.firstName || '');
  const [lastName, setLastName] = useState(initialPrefill?.lastName || '');
  const [address, setAddress] = useState(initialPrefill?.address || '');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState(initialPrefill?.city || '');
  const [postalCode, setPostalCode] = useState(initialPrefill?.postalCode || '');
  const [newsletter, setNewsletter] = useState(true);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Courier & Payment State
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [payErrors, setPayErrors] = useState<string[]>([]);

  // Promo Code State
  const [couponCode, setCouponCode] = useState(initialPromoCode);
  const [appliedPromo, setAppliedPromo] = useState(initialPromoCode);
  const [appliedDiscount, setAppliedDiscount] = useState(initialDiscount);
  const [promoError, setPromoError] = useState('');

  // Post-purchase feedback
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);
  const [moodWritten, setMoodWritten] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Success details state
  const [orderId, setOrderId] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const calculatedShippingThreshold = 500;
  const isFreeShipEligible = subtotal >= calculatedShippingThreshold || subtotal === 0;
  
  const shippingCost = useMemo(() => {
    if (shippingMethod === 'express') return 15;
    return isFreeShipEligible ? 0 : 15;
  }, [shippingMethod, isFreeShipEligible]);

  const total = subtotal - appliedDiscount + shippingCost;

  // Coupon handling inside checkout page
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const found = ACTIVE_COUPONS.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (found) {
      setAppliedPromo(found.code);
      setPromoError('');
      if (found.type === 'percent') {
        setAppliedDiscount(Math.round(subtotal * found.val));
      } else {
        setAppliedDiscount(Math.min(subtotal, found.val));
      }
    } else {
      setPromoError('Unknown promotional code.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setCouponCode('');
    setAppliedDiscount(0);
  };

  // Validate Step 1 shipping form
  const validateShippingForm = () => {
    const errs: string[] = [];
    if (!email.includes('@')) errs.push('A valid email coordinate is required.');
    if (!firstName.trim() || !lastName.trim()) errs.push('Completing first and last names is required.');
    if (!address.trim()) errs.push('Shipping address is required.');
    if (!city.trim()) errs.push('Delivery city is required.');
    if (!postalCode.trim()) errs.push('Postal or Zip code is required.');

    setFormErrors(errs);
    return errs.length === 0;
  };

  const handleGoToPayment = () => {
    if (validateShippingForm()) {
      setStep(2);
    }
  };

  // Validate Step 2 payment form
  const validatePaymentForm = () => {
    const errs: string[] = [];
    if (!cardName.trim()) errs.push('Cardholder name required.');
    if (cardNumber.replace(/\s/g, '').length < 13) errs.push('Secure credit card number requires at least 13-16 digits.');
    if (!cardExp.includes('/')) errs.push('Validity expiry (MM/YY) required.');
    if (cardCvv.length < 3) errs.push('Security key CVV card signature is missing (3-4 digits).');

    setPayErrors(errs);
    return errs.length === 0;
  };

  // Simulator effect
  useEffect(() => {
    if (step === 3) {
      // Simulate real bank authorization phases with relaxing, meditative copy
      const timer1 = setTimeout(() => {
        setLoadingText('Synchronizing ledger keys with secure sandbox gateway...');
      }, 1200);

      const timer2 = setTimeout(() => {
        setLoadingText('Atmospheric confirmation secured. Establishing order logs...');
      }, 2600);

      const timer3 = setTimeout(() => {
        // Prepare Success Details
        const rDigits = Math.floor(10000 + Math.random() * 90000);
        const rBatch = Math.floor(100 + Math.random() * 900);
        const finalOrderId = `NAMI-${rDigits}-${rBatch}`;
        setOrderId(finalOrderId);

        // Format calendar days from today for delivery date (e.g. 3 business days)
        const date = new Date();
        const transitDays = shippingMethod === 'express' ? 2 : 4;
        date.setDate(date.getDate() + transitDays);
        const finalArrivalDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        setArrivalDate(finalArrivalDate);

        // Notify parent order is complete so we log it in order history state
        if (onOrderCreated) {
          onOrderCreated({
            id: finalOrderId,
            items: [...items],
            total,
            subtotal,
            discount: appliedDiscount,
            shippingCost,
            shippingMethod,
            arrivalDate: finalArrivalDate,
            createdAt: new Date().toISOString(),
            email,
            recipientName: `${firstName} ${lastName}`.trim(),
            address: `${address}${apt ? `, ${apt}` : ''}, ${city}, ${postalCode}`.trim(),
            status: 'Processed'
          });
        }

        // Clear cart globally
        if (onClearCart) onClearCart();

        setStep(4);
      }, 4200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [
    step,
    shippingMethod,
    onClearCart,
    onOrderCreated,
    items,
    total,
    subtotal,
    appliedDiscount,
    shippingCost,
    email,
    firstName,
    lastName,
    address,
    apt,
    city,
    postalCode
  ]);

  const handleClearReviewAndComplete = () => {
    onBack();
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 bg-[#F5F2EB] animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        
        {/* Back navigation - only show in entry steps */}
        {step < 3 && (
          <button 
            onClick={() => {
              if (step === 2) setStep(1);
              else onBack();
            }}
            className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26] transition-colors mb-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {step === 2 ? 'Back to Addresses' : 'Return to Shop'}
          </button>
        )}

        {/* STEP 3: Cryptographic Bank Loading (Calm, breathing visual) */}
        {step === 3 && (
          <div className="max-w-md mx-auto text-center py-20 px-6 bg-[#EBE7DE]/40 border border-[#D6D1C7] flex flex-col items-center justify-center space-y-8 shadow-sm">
            
            {/* Meditative floating dot */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-[#2C2A26]/5 rounded-full animate-ping duration-1000"></div>
              <div className="w-14 h-14 bg-[#2C2A26] text-white flex items-center justify-center rounded-full shadow-lg">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif italic text-2xl text-[#2C2A26]">Securing Nami Token</h3>
              <p className="text-sm text-[#5D5A53] font-light italic animate-pulse h-12 flex items-center justify-center px-4">
                {loadingText}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Success confirmation Dashboard (The ultimate e-commerce prize) */}
        {step === 4 && (
          <div className="space-y-12 max-w-4xl mx-auto animate-fade-in-up">
            
            {/* Header Success block */}
            <div className="text-center py-8 border-b border-[#D6D1C7]/60 space-y-4">
              <div className="w-12 h-12 bg-[#76846E]/10 text-[#76846E] rounded-full mx-auto flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-[#2C2A26]">Order Cleared.</h1>
              <p className="text-sm text-[#5D5A53] max-w-md mx-auto font-light">
                Thank you for selecting quiet luxury. We have dispatched your specs to our dispatch artisans. An elegant manual dispatch confirmation has been scheduled.
              </p>
              
              <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-mono">
                <span className="bg-white border border-[#D6D1C7] px-4 py-2 text-[#2C2A26]">
                  ORDER ID: <strong className="font-semibold">{orderId}</strong>
                </span>
                <span className="bg-white border border-[#D6D1C7] px-4 py-2 text-[#2C2A26]">
                  EST. ARRIVAL: <strong className="font-semibold">{arrivalDate}</strong>
                </span>
              </div>
            </div>

            {/* Shipment tracking pipeline */}
            <div className="bg-white p-6 md:p-8 border border-[#D6D1C7] space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2C2A26]">Shipment Tracking status</h3>
              
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Horizontal line */}
                <div className="absolute top-3.5 left-[12%] right-[12%] h-[1px] bg-[#D6D1C7] z-0"></div>
                
                <div className="text-center space-y-2 z-10">
                  <span className="w-8 h-8 rounded-full bg-[#2C2A26] text-[#F5F2EB] flex items-center justify-center text-xs font-bold mx-auto">1</span>
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#2C2A26]">Processed</span>
                </div>

                <div className="text-center space-y-2 z-10 opacity-40">
                  <span className="w-8 h-8 rounded-full bg-white border border-[#D6D1C7] text-[#2C2A26] flex items-center justify-center text-xs font-bold mx-auto">2</span>
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#A8A29E]">Dispached</span>
                </div>

                <div className="text-center space-y-2 z-10 opacity-40">
                  <span className="w-8 h-8 rounded-full bg-white border border-[#D6D1C7] text-[#2C2A26] flex items-center justify-center text-xs font-bold mx-auto">3</span>
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#A8A29E]">In Transit</span>
                </div>

                <div className="text-center space-y-2 z-10 opacity-40">
                  <span className="w-8 h-8 rounded-full bg-white border border-[#D6D1C7] text-[#2C2A26] flex items-center justify-center text-xs font-bold mx-auto">4</span>
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#A8A29E]">Delivered</span>
                </div>
              </div>
            </div>

            {/* Invoice invoice summary split with sensory feedback form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Printable Invoice receipt */}
              <div className="p-8 bg-white border border-[#D6D1C7] space-y-6">
                <div className="flex justify-between items-start border-b border-[#D6D1C7]/50 pb-4">
                  <div>
                    <span className="font-serif italic text-xl text-[#2C2A26]">NAMI RECIPIENT</span>
                    <span className="block text-[10px] text-[#A8A29E] mt-1">ISSUED FROM SANDBOX CORE</span>
                  </div>
                  <span className="text-xs text-[#5D5A53] font-mono">{new Date().toLocaleDateString()}</span>
                </div>

                {/* Shipping metadata details */}
                <div className="text-xs text-[#5D5A53] leading-relaxed space-y-1">
                  <span className="block font-bold uppercase text-[#2C2A26] mb-2">Recipient Address:</span>
                  <p>{firstName} {lastName}</p>
                  <p>{address} {apt && `, ${apt}`}</p>
                  <p>{city}, {postalCode}</p>
                  <p className="font-mono text-[10px] pt-1">{email}</p>
                </div>

                {/* Subtotals invoice ledger */}
                <div className="border-t border-[#D6D1C7]/30 pt-4 space-y-1 text-xs text-[#5D5A53]">
                  <span className="block font-bold uppercase text-[#2C2A26] mb-2">Invoice Specs:</span>
                  <div className="flex justify-between">
                    <span>Products Subtotal</span>
                    <span>${subtotal}</span>
                  </div>
                  
                  {appliedPromo && (
                    <div className="flex justify-between text-[#76846E]">
                      <span>Offer Rebate ({appliedPromo})</span>
                      <span>-${appliedDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{shippingMethod === 'express' ? 'Express Carrier' : 'Standard Courier'}</span>
                    <span>{shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}</span>
                  </div>

                  <div className="flex justify-between font-bold text-[#2C2A26] text-sm pt-3 border-t border-[#D6D1C7]/30 mt-3">
                    <span>Grand Total Resolved</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>

              {/* Sensory Feedback Section */}
              <div className="bg-[#EBE7DE]/40 p-8 border border-[#D6D1C7] flex flex-col justify-between">
                <div>
                  <h3 className="font-serif italic text-xl text-[#2C2A26] mb-2">Nami Bond Resonance</h3>
                  <p className="text-xs text-[#5D5A53] font-light leading-relaxed mb-6">
                    As you join Nami, which optimal frequency describes your aspiration best? Select a mood for custom validation:
                  </p>

                  {feedbackSubmitted ? (
                    <div className="p-4 bg-white border border-[#D6D1C7]/40 text-xs text-[#5D5A53] leading-relaxed animate-fade-in-up space-y-3">
                      <span className="block font-bold uppercase tracking-wider text-[#2C2A26]">Assessed Resonance Frequency: {moodFeedback}</span>
                      <p><em>"{moodWritten}"</em></p>
                      <p className="text-[10px] text-[#A8A29E] pt-2 border-t border-[#D6D1C7]/20">Artisan assessment successfully logged into your order profile.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {['Peaceful', 'Centered', 'Uplifted'].map((mood) => (
                          <button
                            key={mood}
                            onClick={() => setMoodFeedback(mood)}
                            className={`px-3 py-1.5 text-xs font-light transition-all duration-300 border ${
                              moodFeedback === mood 
                                ? 'bg-[#2C2A26] text-white border-[#2C2A26]' 
                                : 'bg-white text-[#5D5A53] border-[#D6D1C7] hover:border-[#2C2A26]'
                            }`}
                          >
                            {mood}
                          </button>
                        ))}
                      </div>

                      {moodFeedback && (
                        <div className="space-y-3 animate-fade-in-up">
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#2C2A26]">Why is this your nami coordinate?</label>
                          <textarea
                            rows={2}
                            value={moodWritten}
                            onChange={(e) => setMoodWritten(e.target.value)}
                            placeholder="State your aesthetic intention..."
                            className="w-full bg-white border border-[#D6D1C7] px-3 py-2 text-xs outline-none text-[#2C2A26] resize-none"
                          />
                          <button
                            onClick={() => setFeedbackSubmitted(true)}
                            className="bg-[#2C2A26] hover:bg-[#433E38] text-white px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors"
                          >
                            Validate Bond
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleClearReviewAndComplete}
                  className="w-full py-3 bg-[#2C2A26] hover:bg-[#3E4A38] text-white border border-[#2C2A26] hover:border-[#3E4A38] uppercase tracking-[0.16em] text-[10px] font-bold transition-all duration-300 mt-8 shadow-sm rounded-lg"
                >
                  Return to Home
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 1 & 2: Active Checkout forms */}
        {step < 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Input Form Column (Left) */}
            <div className="space-y-12">
              
              {/* Funnel title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-[#2C2A26] tracking-tight mb-2">Boutique Checkout</h1>
                <div className="flex gap-4 items-center">
                  <span className={`text-xs uppercase tracking-wider font-semibold ${step === 1 ? 'text-[#2C2A26] border-b border-[#2C2A26]' : 'text-[#A8A29E]'}`}>1. Shipping Address</span>
                  <svg className="w-3 h-3 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/></svg>
                  <span className={`text-xs uppercase tracking-wider font-semibold ${step === 2 ? 'text-[#2C2A26] border-b border-[#2C2A26]' : 'text-[#A8A29E]'}`}>2. Custom Order Payment</span>
                </div>
              </div>

              {/* STEP 1 Form: Contact & Shipping address */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* Contact section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-serif text-[#2C2A26] border-b border-[#D6D1C7]/40 pb-2 pb-2">Contact details</h2>
                    <input 
                      type="email" 
                      placeholder="Email Coordinate (for receipts)" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                    />
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="newsletter" 
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="accent-[#2C2A26] cursor-pointer" 
                      />
                      <label htmlFor="newsletter" className="text-xs text-[#5D5A53] cursor-pointer selection:bg-transparent">
                        Sync my ledger with seasonal releases and sensory updates
                      </label>
                    </div>
                  </div>

                  {/* Delivery details */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-serif text-[#2C2A26] border-b border-[#D6D1C7]/40 pb-2">Delivery location</h2>
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                         type="text" 
                         placeholder="First Name" 
                         value={firstName}
                         onChange={(e) => setFirstName(e.target.value)}
                         className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                       />
                       <input 
                         type="text" 
                         placeholder="Last Name" 
                         value={lastName}
                         onChange={(e) => setLastName(e.target.value)}
                         className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                       />
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="Street Address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                    />
                    
                    <input 
                      type="text" 
                      placeholder="Apartment, suite, block, etc. (optional)" 
                      value={apt}
                      onChange={(e) => setApt(e.target.value)}
                      className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                         type="text" 
                         placeholder="City" 
                         value={city}
                         onChange={(e) => setCity(e.target.value)}
                         className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                       />
                       <input 
                         type="text" 
                         placeholder="Postal/Zip Code" 
                         value={postalCode}
                         onChange={(e) => setPostalCode(e.target.value)}
                         className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                       />
                    </div>
                  </div>

                  {/* Errors Block */}
                  {formErrors.length > 0 && (
                    <div className="p-4 bg-red-800/10 border-l-2 border-red-800 space-y-1 text-xs text-red-800 font-medium">
                      {formErrors.map((err, idx) => <p key={idx}>{err}</p>)}
                    </div>
                  )}

                  {/* Continue button */}
                  <button 
                    onClick={handleGoToPayment}
                    className="w-full py-3 bg-[#2C2A26] hover:bg-[#3E4A38] text-white border border-[#2C2A26] hover:border-[#3E4A38] uppercase tracking-[0.16em] text-[10px] font-bold transition-all duration-300 shadow-sm rounded-lg"
                  >
                    Confirm Delivery Specs — Step 2
                  </button>

                </div>
              )}

              {/* STEP 2 Form: Payment details */}
              {step === 2 && (
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* Courier selection */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-serif text-[#2C2A26] border-b border-[#D6D1C7]/40 pb-2">Carrier Dispatch Style</h2>
                    
                    <div className="space-y-3">
                      {/* Standard Delivery */}
                      <label 
                        onClick={() => setShippingMethod('standard')}
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                          shippingMethod === 'standard' 
                            ? 'border-[#2C2A26] bg-[#2C2A26]/5' 
                            : 'border-[#D6D1C7] bg-white/40 hover:border-[#2C2A26]'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={shippingMethod === 'standard'} 
                            onChange={() => setShippingMethod('standard')}
                            className="accent-[#2C2A26]" 
                          />
                          <div>
                            <span className="block text-sm font-semibold text-[#2C2A26]">Standard Ground Courier</span>
                            <span className="text-[10px] text-[#5D5A53] font-light">Takes 4–5 business days under standard dispatch</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2C2A26]">
                          {isFreeShipEligible ? 'Complimentary' : '$15'}
                        </span>
                      </label>

                      {/* Express Delivery */}
                      <label 
                        onClick={() => setShippingMethod('express')}
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                          shippingMethod === 'express' 
                            ? 'border-[#2C2A26] bg-[#2C2A26]/5' 
                            : 'border-[#D6D1C7] bg-white/40 hover:border-[#2C2A26]'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={shippingMethod === 'express'} 
                            onChange={() => setShippingMethod('express')}
                            className="accent-[#2C2A26]" 
                          />
                          <div>
                            <span className="block text-sm font-semibold text-[#2C2A26]">Secured Lightning Express</span>
                            <span className="text-[10px] text-[#5D5A53] font-light">Custom fragile wrap, loaded in 2 business days</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#2C2A26]">$15</span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-serif text-[#2C2A26] border-b border-[#D6D1C7]/40 pb-2">Secure Credit Card Gateway</h2>
                    
                    <div className="space-y-4 p-6 border border-[#D6D1C7] bg-white shadow-sm">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-1.5">Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder="Alexandra Finch" 
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-transparent border-b border-[#D6D1C7] pb-2 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-1.5">Card Number</label>
                        <input 
                          type="text" 
                          maxLength={19}
                          placeholder="XXXX XXXX XXXX XXXX" 
                          value={cardNumber}
                          onChange={(e) => {
                            // Format space every 4 digits
                            const v = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(v);
                          }}
                          className="w-full bg-transparent border-b border-[#D6D1C7] pb-2 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors font-mono" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-1.5">Expiration date</label>
                          <input 
                            type="text" 
                            maxLength={5}
                            placeholder="MM/YY" 
                            value={cardExp}
                            onChange={(e) => {
                              let v = e.target.value;
                              if (v.length === 2 && !v.includes('/')) v += '/';
                              setCardExp(v);
                            }}
                            className="w-full bg-transparent border-b border-[#D6D1C7] pb-2 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors font-mono" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-1.5">Security Code (CVV)</label>
                          <input 
                            type="password" 
                            maxLength={4}
                            placeholder="123" 
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-transparent border-b border-[#D6D1C7] pb-2 text-sm text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Errors Block */}
                  {payErrors.length > 0 && (
                    <div className="p-4 bg-red-800/10 border-l-2 border-red-800 space-y-1 text-xs text-red-800 font-medium">
                      {payErrors.map((err, idx) => <p key={idx}>{err}</p>)}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-4 border border-[#D6D1C7] text-[#2C2A26] hover:bg-[#EBE7DE]/40 uppercase tracking-widest text-xs font-semibold transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (validatePaymentForm()) {
                          setStep(3);
                        }
                      }}
                      className="flex-1 py-3 bg-[#2C2A26] hover:bg-[#3E4A38] text-white border border-[#2C2A26] hover:border-[#3E4A38] uppercase tracking-[0.16em] text-[10px] font-bold transition-all duration-300 shadow-sm rounded-lg"
                    >
                      Process Ledger Payment — ${total}
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Right Column: Complete Summary list (With Coupon injection) */}
            <div className="lg:pl-12 lg:border-l border-[#D6D1C7]">
              <h2 className="text-xl font-serif text-[#2C2A26] mb-8 border-b border-[#D6D1C7]/40 pb-2">Nami Order Summary</h2>
              
              {/* Product items loop */}
              <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                 {items.map((item, idx) => (
                   <div key={`${item.id}-${idx}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-[#EBE7DE] relative flex-shrink-0">
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <h3 className="font-serif text-[#2C2A26] text-sm font-medium">{item.name}</h3>
                         <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest">{item.category}</p>
                      </div>
                      <span className="text-sm font-light text-[#5D5A53]">${item.price}</span>
                   </div>
                 ))}
              </div>

              {/* Coupon code processing block */}
              <div className="border-t border-[#D6D1C7]/50 pt-6 pb-6 border-b border-[#D6D1C7]/50 space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#2C2A26]">Promotional Coupon Code</span>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    placeholder="e.g. NAMI10" 
                    className="flex-1 bg-white border border-[#D6D1C7]/70 focus:border-[#2C2A26] px-3 py-2 text-xs outline-none text-[#2C2A26] font-mono"
                  />
                  <button 
                    type="submit"
                    className="bg-[#2C2A26] hover:bg-[#433E38] text-white px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition-all"
                  >
                    Apply Coupon
                  </button>
                </form>
                {promoError && <p className="text-[10px] font-medium text-red-800">{promoError}</p>}
                
                {/* Active promotion visual tag */}
                {appliedPromo && (
                  <div className="flex items-center justify-between bg-[#76846E]/10 border border-[#76846E]/30 p-2.5 text-xs text-stone-700 font-mono">
                    <span>Applied Coupon: **{appliedPromo}**</span>
                    <button 
                      onClick={handleRemovePromo}
                      className="text-stone-400 hover:text-red-700 font-bold px-1.5 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* pricing indicators and calculation summaries */}
              <div className="pt-6 space-y-2.5 text-xs text-[#5D5A53]">
                <div className="flex justify-between">
                   <span>Items Subtotal</span>
                   <span>${subtotal}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#76846E]">
                     <span>Applied Discount ({appliedPromo})</span>
                     <span>-${appliedDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                   <span>{shippingMethod === 'express' ? 'Lightning Express Courier' : 'Standard Ground Courier'}</span>
                   <span>{shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}</span>
                </div>
              </div>
              
              {/* Grand Total Row */}
              <div className="border-t border-[#D6D1C7] mt-6 pt-6">
                 <div className="flex justify-between items-center">
                   <span className="font-serif text-xl text-[#2C2A26]">Grand Total resolved</span>
                   <div className="flex items-end gap-2">
                     <span className="text-[10px] text-[#A8A29E] mb-1">USD</span>
                     <span className="font-serif text-2xl text-[#2C2A26] font-semibold">${total}</span>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
