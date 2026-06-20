/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface Quote {
  id: string;
  source: string;
  quote: string;
  location: string;
  isCustom?: boolean;
}

const DEFAULT_QUOTES: Quote[] = [
  {
    id: 'q1',
    source: 'Monocle Magazine',
    quote: 'Nami rejects the hyper-stimulated flashing metrics of conventional wearables in favor of high tactile philosophy. These objects are built to whisper.',
    location: 'December Editorial'
  },
  {
    id: 'q2',
    source: 'Kinfolk Quarterly',
    quote: 'Running our hands over the raw kyoto sandstone casing was a masterclass in design restraint. It triggers visual sensory fasts we desperately need.',
    location: 'Issue 42 Design'
  },
  {
    id: 'q3',
    source: 'Kyoto Artisan Review',
    quote: 'The organic bio-filters are reminiscent of centuries-old mountain tea gardens. They have crafted an ecosystem where technology recedes entirely.',
    location: 'Spring Column'
  }
];

const Testimonials: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>(DEFAULT_QUOTES);
  const [activeIdx, setActiveIdx] = useState(0);

  // Form states
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSource, setNewQuoteSource] = useState('');
  const [newQuoteLocation, setNewQuoteLocation] = useState('');
  const [success, setSuccess] = useState(false);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % quotes.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const handleSubmitGuestbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim() || !newQuoteSource.trim()) return;

    const guest: Quote = {
      id: String(Date.now()),
      quote: newQuoteText,
      source: newQuoteSource,
      location: newQuoteLocation.trim() || 'Guest Log',
      isCustom: true
    };

    setQuotes(prev => [guest, ...prev]);
    setActiveIdx(0); // View the newly submitted quote first
    setNewQuoteText('');
    setNewQuoteSource('');
    setNewQuoteLocation('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  const current = quotes[activeIdx];

  return (
    <motion.section 
      id="sensory-retreat" 
      className="py-24 px-6 md:px-12 bg-[#EBE7DE] border-t border-[#D6D1C7]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-[1800px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Block - Slider */}
          <div className="lg:col-span-7 flex flex-col justify-between min-h-[420px] bg-[#FBF9F6] border border-[#D6D1C7] p-8 md:p-12 relative shadow-sm">
            
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A8A29E]">Press & Guest Chronicles</span>
              
              {/* Active Quote Content */}
              <div className="animate-fade-in relative min-h-[160px] pt-8" key={current.id}>
                {/* Huge stylized double quote marks in background */}
                <span className="absolute left-0 top-0 text-[120px] font-serif leading-none select-none text-[#D6D1C7]/30">“</span>
                
                <p className="text-xl md:text-2xl font-serif text-[#2C2A26] leading-relaxed italic relative z-10">
                  {current.quote}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#D6D1C7]/60 pt-8 gap-4 mt-8">
              <div>
                <h4 className="font-serif font-semibold text-base text-[#2C2A26]">{current.source}</h4>
                <p className="text-xs text-[#5D5A53] font-light">{current.location}</p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[#A8A29E] font-medium uppercase tracking-widest">
                  {activeIdx + 1} / {quotes.length}
                </span>

                <div className="flex gap-1">
                  <button 
                    onClick={handlePrev}
                    id="guestbook-prev-btn"
                    className="p-3 border border-[#D6D1C7] bg-[#F5F2EB] hover:bg-[#EBE7DE] text-[#2C2A26] transition-colors cursor-pointer"
                    title="Previous Quote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleNext}
                    id="guestbook-next-btn"
                    className="p-3 border border-[#D6D1C7] bg-[#F5F2EB] hover:bg-[#EBE7DE] text-[#2C2A26] transition-colors cursor-pointer"
                    title="Next Quote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block - Interactive Guestbook form */}
          <div className="lg:col-span-5 bg-white border border-[#D6D1C7] p-8 md:p-10 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A8A29E]">The Reflection Chronicle</span>
                <h3 className="text-2xl font-serif text-[#2C2A26]">What does "Quiet Living" represent in your home?</h3>
                <p className="text-xs text-[#5D5A53] font-light leading-relaxed">
                  Log your thoughts on tactile materiality, focus, or empty negative space. Your reflection will be cataloged instantly in our active guestbook.
                </p>
              </div>

              {success ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs text-emerald-850 font-light font-sans">
                  Your atmospheric reflection was added to our logs. Scroll down or click next in our guestbook columns to read it!
                </div>
              ) : (
                <form onSubmit={handleSubmitGuestbook} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-[#2C2A26] mb-1.5">How would you summarize your sentiment?</label>
                    <textarea 
                      required
                      rows={3}
                      value={newQuoteText}
                      onChange={(e) => setNewQuoteText(e.target.value)}
                      placeholder='e.g., "Finding hours where my fingertips meet polished stone in place of cold notification buzzes..."'
                      className="w-full bg-[#F5F2EB]/50 border border-[#D6D1C7] focus:border-[#2C2A26] text-xs outline-none p-3.5 text-[#2C2A26] resize-none placeholder-[#A8A29E] font-serif italic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-[#2C2A26] mb-1.5">Author (Your Name)</label>
                      <input 
                        type="text" 
                        required
                        value={newQuoteSource}
                        onChange={(e) => setNewQuoteSource(e.target.value)}
                        placeholder="e.g., Clara Jenkins"
                        className="w-full bg-[#F5F2EB]/50 border border-[#D6D1C7] focus:border-[#2C2A26] text-xs outline-none px-3.5 py-2.5 text-[#2C2A26] placeholder-[#A8A29E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-[#2C2A26] mb-1.5">Origin / City</label>
                      <input 
                        type="text"
                        value={newQuoteLocation}
                        onChange={(e) => setNewQuoteLocation(e.target.value)}
                        placeholder="e.g., Copenhagen"
                        className="w-full bg-[#F5F2EB]/50 border border-[#D6D1C7] focus:border-[#2C2A26] text-xs outline-none px-3.5 py-2.5 text-[#2C2A26] placeholder-[#A8A29E]"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#2C2A26] text-[#F5F2EB] uppercase tracking-widest text-[10px] font-semibold hover:bg-[#433E38] transition-all"
                  >
                    Commit Chronicle Segment
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.section>
  );
};

export default Testimonials;
