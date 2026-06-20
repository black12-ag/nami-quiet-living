/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { sendMessageToGemini } from '../services/geminiService';
import { Star, MessageSquare, ThumbsUp, Sparkles, Filter, Check, Award, Smile, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

const DEFAULT_REVIEWS: Record<string, Review[]> = {
  p1: [
    { id: '1', name: 'Evelyn V.', rating: 5, date: 'May 14, 2026', comment: 'The acoustic canvas is incredibly soft, and the soundstage feels like sitting in an empty orchard. Absolutely breathtaking craftsmanship.' },
    { id: '2', name: 'Marcus L.', rating: 4, date: 'April 29, 2026', comment: 'Extremely comfortable for long listening sessions. The sandstone composite has a lovely weight and organic temperature.' }
  ],
  p2: [
    { id: '1', name: 'Sora K.', rating: 5, date: 'June 02, 2026', comment: 'This timepiece completely altered my relationship with notifications. The E-Ink flow is peaceful, and the vibration reminders to breathe are genuinely grounding.' },
    { id: '2', name: 'Clara M.', rating: 5, date: 'May 20, 2026', comment: 'Polished ceramic looks like a river stone on the wrist. Battery easily lasts 8 days.' }
  ],
  p3: [
    { id: '1', name: 'Julian R.', rating: 5, date: 'June 05, 2026', comment: 'A phenomenal sketching experience. Zero glare under direct sunlight thanks to the matte, nano-etched glass.' },
    { id: '2', name: 'Anya T.', rating: 4, date: 'May 11, 2026', comment: 'Colors are wonderfully saturated yet gentle on the eyes. It feels like looking at premium printed silk.' }
  ],
  p4: [
    { id: '1', name: 'Daniel S.', rating: 5, date: 'April 15, 2026', comment: 'The moss aromatherapy is incredibly calming. It sits in my master bedroom like an ancient shrine that secretly purifies.' }
  ],
  p5: [
    { id: '1', name: 'Hana W.', rating: 5, date: 'May 28, 2026', comment: 'Pure magic. Transitioning from cold blue sunrise to candlelight amber occurs fluidly. Wave gesture sensor works masterfully!' }
  ],
  p6: [
    { id: '1', name: 'Thomas F.', rating: 5, date: 'May 01, 2026', comment: 'The friction tips genuinely make doing digital illustration feel tactile again. Charges securely against the canvas.' }
  ]
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, onViewProduct }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [selectedColor, setSelectedColor] = useState('Pearl');
  
  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  
  // Hover-to-Zoom State for texture inspection
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };
  
  // Q&A Widget States
  const [qaQuery, setQaQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [isQaThinking, setIsQaThinking] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  const handleHelpfulClick = (reviewId: string) => {
    if (votedReviews[reviewId]) return;
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    setVotedReviews(prev => ({
      ...prev,
      [reviewId]: true
    }));
  };

  // Initial load of reviews and reset views
  useEffect(() => {
    setActiveImage(product.imageUrl);
    const existing = DEFAULT_REVIEWS[product.id] || [];
    setReviews(existing);
    setQaAnswer('');
    setQaQuery('');
    setReviewSuccess(false);
  }, [product]);

  // Recently Viewed tracker effect
  useEffect(() => {
    const saved = localStorage.getItem('nami_recently_viewed');
    let ids: string[] = [];
    if (saved) {
      try {
        ids = JSON.parse(saved);
      } catch (e) {
        // Safe fail
      }
    }

    const items = ids
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter((p): p is Product => !!p && p.id !== product.id);

    setRecentlyViewed(items);

    let updatedIds = ids.filter(id => id !== product.id);
    updatedIds.unshift(product.id);
    updatedIds = updatedIds.slice(0, 10);
    localStorage.setItem('nami_recently_viewed', JSON.stringify(updatedIds));
  }, [product.id]);

  // Gallery images selection helper
  const gallery = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.imageUrl];

  const sizes = ['S', 'M', 'L'];
  const showSizes = product.category === 'Wearable';

  // Ask Gemini about this product
  const handleAskProductQA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuery.trim()) return;

    setIsQaThinking(true);
    setQaAnswer('');

    try {
      const systemContext = [
        {
          role: 'model',
          text: `You are the product specialist for the Nami device: "${product.name}". 
          Key specifications: Price $${product.price}, Tagline "${product.tagline}", Description: "${product.description}". Detailed specifications: "${product.longDescription || ''}". Key features: ${product.features.join(', ')}.
          Answer user inquiries with absolute clarity, calm demeanor, and poetic brevity. Keep response within 2-3 sentences max.`
        }
      ];

      const answer = await sendMessageToGemini(systemContext, `A buyer is looking at "${product.name}" and asks: "${qaQuery}". Provide a refined specialist response.`);
      setQaAnswer(answer);
    } catch (err) {
      setQaAnswer("I couldn't contact the archives. However, we ensure this object is designed to resonate with you.");
    } finally {
      setIsQaThinking(false);
    }
  };

  // Submit dynamic review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: String(Date.now()),
      name: newReviewName,
      rating: newReviewRating,
      date: 'Today',
      comment: newReviewComment
    };

    setReviews(prev => [newRev, ...prev]);
    setNewReviewName('');
    setNewReviewRating(5);
    setNewReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const colors = [
    { name: 'Pearl', bgClass: 'bg-[#EDEBE5]', borderClass: 'border-[#EDEBE5]' },
    { name: 'Charcoal', bgClass: 'bg-[#43413E]', borderClass: 'border-[#43413E]' },
    { name: 'Sage', bgClass: 'bg-[#949B8E]', borderClass: 'border-[#949B8E]' }
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#F5F2EB] animate-fade-in-up">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-24">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26] transition-colors mb-12"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Shop
        </button>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 border-b border-[#D6D1C7] pb-20">
          
          {/* Left Column: Gallery Switcher */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            
            {/* Gallery Sidebar */}
            {gallery.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto no-scrollbar md:w-24">
                {gallery.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 md:w-20 md:h-24 flex-shrink-0 bg-[#EBE7DE] overflow-hidden border transition-all duration-300 ${
                      activeImage === img ? 'border-[#2C2A26] ring-1 ring-[#2C2A26]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Hero Interactive Image Container */}
            <div 
              className="flex-1 bg-[#EBE7DE] aspect-[4/5] overflow-hidden order-1 md:order-2 shadow-sm rounded-none relative cursor-zoom-in group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => {
                setIsZoomed(false);
                setZoomPos({ x: 50, y: 50 });
              }}
              onMouseMove={handleZoomMouseMove}
            >
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 ease-out"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)'
                }}
              />
              
              {/* Material texture helper badge */}
              <div className="absolute right-4 bottom-4 bg-[#2C2A26]/85 backdrop-blur-sm text-[#F5F2EB] text-[9px] uppercase tracking-widest font-mono font-medium px-2.5 py-1.5 transition-all duration-300 rounded pointer-events-none opacity-0 group-hover:opacity-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#76846E] rounded-full animate-pulse"></span>
                <span>{isZoomed ? 'Pannable View' : 'Hover to Zoom Texture'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Buying Details */}
          <div className="lg:col-span-5 flex flex-col justify-center">
             <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-[0.2em] mb-3">{product.category}</span>
             <h1 className="text-4xl md:text-5xl font-serif text-[#2C2A26] tracking-tight mb-4">{product.name}</h1>
             <div className="flex items-center gap-4 mb-8 flex-wrap" id="product-detail-meta-container">
               <span className="text-2xl font-light text-[#2C2A26]">${product.price}</span>
               <div className="h-4 w-[1px] bg-[#D6D1C7]"></div>
                  
               {/* Star Rating summary */}
               <button 
                 onClick={() => {
                   const rSection = document.getElementById('reviews-section');
                   if (rSection) rSection.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="flex items-center gap-1 group/rating cursor-pointer hover:opacity-85 transition-opacity"
               >
                 {[...Array(5)].map((_, i) => {
                   const avgValue = reviews.length > 0 
                     ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) 
                     : 5.0;
                   return (
                     <Star 
                       key={i} 
                       className={`w-3.5 h-3.5 ${i < Math.round(avgValue) ? 'text-[#2C2A26] fill-[#2C2A26]' : 'text-[#D6D1C7]'}`} 
                     />
                   );
                 })}
                 <span className="text-xs text-[#5D5A53] ml-1 group-hover/rating:underline">
                   {(reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0")} ({reviews.length})
                 </span>
               </button>

               {product.inventoryCount !== undefined && (
                 <>
                   <div className="h-4 w-[1px] bg-[#D6D1C7] hidden sm:block"></div>
                   <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-semibold rounded-none ${
                     product.inventoryCount <= 5 
                       ? 'bg-[#A34E36]/10 text-[#A34E36] border border-[#A34E36]/20' 
                       : 'bg-[#949B8E]/10 text-[#2C2A26]/75 border border-[#949B8E]/25'
                   }`}>
                     {product.inventoryCount <= 5 ? `Low Stock (Only ${product.inventoryCount} left!)` : 'In Stock & ready to ship'}
                   </span>
                 </>
               )}
             </div>
             
             {/* Product Prose */}
             <p className="text-[#5D5A53] leading-relaxed font-light text-base mb-8 border-b border-[#D6D1C7] pb-8">
               {product.longDescription || product.description}
             </p>

             {/* Variant 1: Color/Material Switcher */}
             <div className="mb-8">
               <span className="block text-xs font-bold uppercase tracking-widest text-[#2C2A26] mb-3">Cabinet / Color Finish : <span className="font-light text-[#5D5A53]">{selectedColor}</span></span>
               <div className="flex gap-4">
                 {colors.map(color => (
                   <button 
                     key={color.name}
                     onClick={() => setSelectedColor(color.name)}
                     className={`w-9 h-9 rounded-full ${color.bgClass} flex items-center justify-center border transition-all duration-300 relative ${
                       selectedColor === color.name 
                         ? 'border-[#2C2A26] ring-2 ring-[#2C2A26]/20' 
                         : 'border-[#D6D1C7] hover:scale-105'
                     }`}
                     title={color.name}
                   >
                     {selectedColor === color.name && (
                       <span className="w-1.5 h-1.5 bg-[#2C2A26] rounded-full"></span>
                     )}
                   </button>
                 ))}
               </div>
             </div>

             {/* Variant 2: Sizes (if wearable) */}
             {showSizes && (
                <div className="mb-8">
                  <span className="block text-xs font-bold uppercase tracking-widest text-[#2C2A26] mb-3">Select Size</span>
                  <div className="flex gap-4">
                    {sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 flex items-center justify-center border transition-all duration-300 ${
                          selectedSize === size 
                            ? 'border-[#2C2A26] bg-[#2C2A26] text-[#F5F2EB]' 
                            : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#2C2A26]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
             )}

             {/* Add to Cart button and quick features */}
             <div className="flex flex-col gap-6">
                <button 
                  onClick={() => onAddToCart({ ...product, id: `${product.id}-${selectedColor}`, name: `${product.name} (${selectedColor})` })}
                  className="w-full py-5 bg-[#2C2A26] text-[#F5F2EB] uppercase tracking-widest text-sm font-medium hover:bg-[#433E38] transition-all duration-300 hover:shadow-md"
                >
                  Add to Cart — ${product.price}
                </button>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-4 text-xs tracking-wider text-[#5D5A53] uppercase font-light">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#2C2A26] rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-[#2C2A26] rounded-full"></span>
                    Complementary Courier Delivery
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-[#2C2A26] rounded-full"></span>
                    2-Year Natural Bond Warranty
                  </li>
                </ul>
             </div>
          </div>
        </div>

        {/* Lower Layout: Embedded Gemini QA widget & Customer Reviews split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mt-20">
          
          {/* Gemini AI Q&A Widget */}
          <div className="lg:col-span-5 bg-[#EBE7DE]/40 p-8 border border-[#D6D1C7]/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-[#2C2A26] rounded-full animate-pulse"></span>
                <h3 className="font-serif italic text-xl text-[#2C2A26]">Nami AI Object Specialist</h3>
              </div>
              <p className="text-sm text-[#5D5A53] font-light leading-relaxed mb-6">
                Have specific design, longevity, or material questions regarding **{product.name}**? Ask our AI artisan for context:
              </p>

              <form onSubmit={handleAskProductQA} className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    value={qaQuery}
                    onChange={(e) => setQaQuery(e.target.value)}
                    placeholder={`e.g., Is ${product.name} handcrafted?`}
                    className="w-full bg-white border border-[#D6D1C7] focus:border-[#2C2A26] px-4 py-3 text-sm outline-none text-[#2C2A26] pr-12 placeholder-[#A8A29E]"
                  />
                  <button 
                    type="submit"
                    disabled={!qaQuery.trim() || isQaThinking}
                    className="absolute right-2 top-2 bg-[#2C2A26] text-[#F5F2EB] p-2 hover:bg-[#433E38] transition-colors disabled:opacity-40"
                  >
                    {isQaThinking ? (
                      <span className="block w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>

              {qaAnswer && (
                <div className="mt-6 p-5 bg-white border border-[#D6D1C7]/40 text-sm leading-relaxed text-[#5D5A53] animate-fade-in-up">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#2C2A26] mb-2">Artisan Assessment:</span>
                  {qaAnswer}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#D6D1C7]/30 text-xs text-[#A8A29E] font-light">
              Powered by Gemini 3.5. Trained with Nami sensory branding instructions.
            </div>
          </div>

          {/* Customer Reviews & Ratings Form */}
          <div className="lg:col-span-7 space-y-12" id="reviews-section">
            
            {/* Reviews Summary Dashboard */}
            <div className="border-b border-[#D6D1C7]/50 pb-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-serif text-[#2C2A26] mb-1">Customer Reviews</h3>
                  <p className="text-sm text-[#A8A29E] font-light">Verified sensory product experiences</p>
                </div>
                
                {filterRating && (
                  <button 
                    onClick={() => setFilterRating(null)}
                    className="flex items-center gap-1.5 text-xs text-[#2C2A26] hover:underline font-mono"
                  >
                    Clear Filter ({filterRating} ★) ×
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/40 p-6 border border-[#D6D1C7]/40 rounded-lg">
                
                {/* Score Column */}
                <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-[#D6D1C7]/30 pb-6 md:pb-0 md:pr-6">
                  <span className="block text-5xl font-serif text-[#2C2A26] tracking-tight">
                    {(reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5.0).toFixed(1)}
                  </span>
                  
                  <div className="flex justify-center gap-0.5 mt-2.5 mb-1.5 text-[#2C2A26]">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5.0) ? 'fill-[#2C2A26] text-[#2C2A26]' : 'text-[#D6D1C7]'}`} 
                      />
                    ))}
                  </div>
                  
                  <span className="text-xs text-[#5D5A53] font-light">
                    Based on {reviews.length} evaluative logs
                  </span>
                </div>

                {/* Rating Distribution Meter Column */}
                <div className="md:col-span-8 space-y-2.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    const isSelected = filterRating === stars;

                    return (
                      <button 
                        key={stars}
                        onClick={() => setFilterRating(isSelected ? null : stars)}
                        className={`w-full flex items-center gap-3 group text-left text-xs text-[#5D5A53] hover:text-[#2C2A26] transition-colors p-1 rounded ${
                          isSelected ? 'bg-white/60 font-semibold text-[#2C2A26]' : ''
                        }`}
                      >
                        <span className="w-8 shrink-0 flex items-center font-mono font-medium gap-0.5">
                          {stars} <Star className="w-3 h-3 fill-current text-[#2C2A26]" />
                        </span>
                        
                        {/* Rating bar */}
                        <div className="flex-1 h-2 bg-[#EBE7DE] rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-[#2C2A26] transition-all duration-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <span className="w-10 text-right text-[11px] font-mono shrink-0 text-[#A8A29E] group-hover:text-[#2C2A26]">
                          {percentage}%
                        </span>
                        
                        <span className="w-6 text-right text-[11px] font-mono shrink-0 text-[#A8A29E]">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List of Reviews */}
            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 no-scrollbar border-b border-[#D6D1C7]/30 pb-8">
              {(filterRating ? reviews.filter(r => r.rating === filterRating) : reviews).length === 0 ? (
                <div className="p-8 text-center bg-white/20 border border-dashed border-[#D6D1C7]/60 rounded-xl space-y-2">
                  <p className="text-sm text-[#2C2A26] font-serif italic">No sensory records found for this star level.</p>
                  <button 
                    onClick={() => setFilterRating(null)}
                    className="text-xs text-[#A8A29E] underline hover:text-[#2C2A26]"
                  >
                    View all customer logs
                  </button>
                </div>
              ) : (
                (filterRating ? reviews.filter(r => r.rating === filterRating) : reviews).map((rev) => (
                  <div key={rev.id} className="p-6 bg-white/50 border border-[#D6D1C7]/30 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#2C2A26]">{rev.name}</span>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold font-mono bg-[#76846E]/10 text-[#76846E] rounded-full border border-[#76846E]/20">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified Record
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A8A29E] font-mono uppercase tracking-widest">{rev.date}</p>
                      </div>

                      <div className="flex text-[#2C2A26]">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#2C2A26] text-[#2C2A26]' : 'text-[#D6D1C7]'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#5D5A53] leading-relaxed font-light font-sans">{rev.comment}</p>
                    
                    {/* Helpful indicator feedback triggers */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#D6D1C7]/20">
                      <span className="text-[10px] text-[#A8A29E] italic">
                        Was this sensory context helpful to you?
                      </span>
                      
                      <button
                        onClick={() => handleHelpfulClick(rev.id)}
                        disabled={votedReviews[rev.id]}
                        className={`flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#F5F2EB] text-[#2C2A26] rounded-full text-xs font-mono transition-all border ${
                          votedReviews[rev.id]
                            ? 'bg-[#2C2A26]! text-white! border-[#2C2A26]'
                            : 'border-stone-200'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({(helpfulVotes[rev.id] || (parseInt(rev.id) || 0) % 4 + 1)})</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a review form */}
            <div className="p-8 border border-[#D6D1C7] bg-[#EBE7DE]/20 space-y-6 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#2C2A26]" />
                <h4 className="text-lg font-serif text-[#2C2A26]">Share Your Experience</h4>
              </div>
              
              {reviewSuccess ? (
                <div className="p-4 bg-[#2C2A26]/10 border border-[#2C2A26] text-sm text-[#2C2A26] rounded flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                  <span>Thank you. Your assessment of this object has been integrated into our logs.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="e.g., Alexandra G."
                        className="w-full bg-white border border-[#D6D1C7] focus:border-[#2C2A26] rounded px-4 py-2.5 text-sm outline-none text-[#2C2A26] placeholder-[#A8A29E]"
                      />
                    </div>
                    
                    {/* Interactive review stars selection component */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-2">Resonance Affinity Selection</label>
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((stars) => {
                            const isHighlighted = hoverRating !== null ? stars <= hoverRating : stars <= newReviewRating;
                            return (
                              <button
                                type="button"
                                key={stars}
                                onMouseEnter={() => setHoverRating(stars)}
                                onMouseLeave={() => setHoverRating(null)}
                                onClick={() => setNewReviewRating(stars)}
                                className="p-1 hover:scale-115 transition-transform"
                              >
                                <Star 
                                  className={`w-6 h-6 ${
                                    isHighlighted 
                                      ? 'fill-[#2C2A26] text-[#2C2A26]' 
                                      : 'text-[#D6D1C7]'
                                  } transition-all duration-200`} 
                                />
                              </button>
                            );
                          })}
                        </div>
                        
                        <span className="text-[11px] text-[#5D5A53] font-mono font-medium ml-2">
                          {{
                            5: "Perfect Resonance (5/5)",
                            4: "High Affinity (4/5)",
                            3: "Grounded (3/5)",
                            2: "Unbalanced (2/5)",
                            1: "High Friction (1/5)"
                          }[hoverRating || newReviewRating] || ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2C2A26] mb-2">Your thoughts</label>
                    <textarea 
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Discuss texture, acoustic comfort, or sensory impact..."
                      className="w-full bg-white border border-[#D6D1C7] focus:border-[#2C2A26] rounded px-4 py-3 text-sm outline-none text-[#2C2A26] placeholder-[#A8A29E] resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-3.5 bg-[#2C2A26] text-[#F5F2EB] uppercase tracking-widest text-[11px] font-semibold hover:bg-[#433E38] transition-colors rounded shadow-sm hover:shadow"
                  >
                    Submit Sensory Log
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* Recently Viewed Carousel */}
        {recentlyViewed.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#D6D1C7]/60 space-y-8 text-left">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#A8A29E] font-semibold block mb-1">Your sensory path</span>
                <h3 className="text-2xl font-serif text-[#2C2A26] tracking-tight">Recently Viewed Objects</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('recently-viewed-track');
                    if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 rounded-full border border-[#D6D1C7] flex items-center justify-center hover:bg-[#2C2A26] hover:text-[#F5F2EB] hover:border-[#2C2A26] transition-all cursor-pointer"
                  aria-label="Previous items"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('recently-viewed-track');
                    if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 rounded-full border border-[#D6D1C7] flex items-center justify-center hover:bg-[#2C2A26] hover:text-[#F5F2EB] hover:border-[#2C2A26] transition-all cursor-pointer"
                  aria-label="Next items"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carousel track */}
            <div 
              id="recently-viewed-track"
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {recentlyViewed.map((item) => (
                <div 
                  key={item.id} 
                  className="min-w-[280px] md:min-w-[320px] max-w-[320px] snap-start shrink-0 group cursor-pointer bg-white/40 border border-[#D6D1C7]/30 hover:border-[#2C2A26]/50 p-4 transition-all rounded-xl"
                  onClick={() => {
                    onViewProduct(item);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden mb-4 relative bg-[#F5F2EB] rounded-lg">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 font-sans" 
                    />
                    <div className="absolute top-2 right-2 bg-[#2C2A26] text-[#F5F2EB] text-[9px] font-mono px-2 py-0.5 tracking-wider uppercase rounded">
                      {item.category}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-serif text-base text-[#2C2A26] group-hover:underline truncate">{item.name}</h4>
                      <span className="font-mono text-sm text-[#2C2A26] font-semibold">${item.price}</span>
                    </div>
                    <p className="text-xs text-[#A8A29E] font-light line-clamp-1">{item.tagline}</p>
                    
                    <div className="flex gap-1.5 pt-2 flex-wrap">
                      {item.features.slice(0, 2).map((feat, idx) => (
                        <span key={idx} className="text-[9px] font-mono tracking-wider bg-[#EBE7DE]/50 text-[#5D5A53] px-2 py-0.5 rounded">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
