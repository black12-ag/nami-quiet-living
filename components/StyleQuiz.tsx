/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { sendMessageToGemini } from '../services/geminiService';

interface StyleQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProduct: (product: Product) => void;
}

interface Question {
  id: number;
  text: string;
  options: { text: string; value: string; desc: string }[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Select your ideal environmental sunrise state:",
    options: [
      { text: "Looming mountain mist & quiet coffee", value: "mist", desc: "You seek heavy silhouettes, solitude, and cool matte stones." },
      { text: "Amber candlelight with warm organic tea", value: "amber", desc: "You find deep comfort in cyclic glowing warmth, wood grains, and soft rustles." },
      { text: "A clean, empty desk drenched in morning sun", value: "sunlight", desc: "You gravitate toward precise paper textures, absolute minimalist silence, and natural light." }
    ]
  },
  {
    id: 2,
    text: "Which tactile material triggers the deepest grounding sensation?",
    options: [
      { text: "Cold, weighted hand-polished ceramic", value: "ceramic", desc: "A dense organic surface that anchors you to the physical present." },
      { text: "Soft, slightly porous knit acoustic wool", value: "wool", desc: "A barrier of textile warmth that absorbs ambient noise and harsh glare." },
      { text: "Fine-grain, untreated raw walnut block", value: "wood", desc: "An imperfect living timber with natural friction and scent." }
    ]
  },
  {
    id: 3,
    text: "Where is the largest structural friction in your daily environment?",
    options: [
      { text: "Excessive, frantic neon screens & blue light", value: "screens", desc: "Your eyes crave a visual fast, soft focus surfaces, and gentle paper ink." },
      { text: "Acoustic clutter & unceasing ringtones", value: "braying", desc: "Your ears demand open-air acoustics or deep focus isolation." },
      { text: "Stale static indoor air & clinical plastic", value: "stale", desc: "You desire living organic matter, companion smells, and purified rooms." }
    ]
  }
];

const StyleQuiz: React.FC<StyleQuizProps> = ({ isOpen, onClose, onViewProduct }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0 to 2 for questions, 3 for active calculation, 4 for reading results
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customAesthetic, setCustomAesthetic] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [alignedProduct, setAlignedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (value: string) => {
    setAnswers(prev => ({ ...prev, [QUIZ_QUESTIONS[currentStep].id]: value }));
    
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Go to customizable final touch step
      setCurrentStep(3);
    }
  };

  const handleTriggerAnalysis = async () => {
    setCurrentStep(4); // Show calculation pulse
    setIsAnalyzing(true);
    setAiAnalysis('');
    setAlignedProduct(null);

    // Map answer values to text description
    const answerTokens = Object.entries(answers).map(([qid, val]) => {
      const q = QUIZ_QUESTIONS.find(item => item.id === Number(qid));
      const opt = q?.options.find(o => o.value === val);
      return `${q?.text} -> ${opt?.text} (${opt?.desc})`;
    }).join('\n');

    try {
      const systemContext = [
        {
          role: 'model',
          text: `You are the chief sensory archivist at Nami Quiet Living. Your goal is to guide the buyer to the ideal physical companion.
          Available Products:
          - Nami Harmony (p1, $280): Wireless Ambient acoustic, sandstone base, warm wool. Great for acoustic clutter and ambient sound comfort.
          - Nami Epoch (p2, $320): E-Ink notification clock companion, polished river ceramic. Perfect for excessive screen fatigue/time management.
          - Nami Slate (p3, $450): Meditative paper-friction sketching board. Best for tactile drawing and screen overload.
          - Nami Flora (p4, $180): Moss botanical purificator. Ideal for stale room environments.
          - Nami Sol (p5, $195): Dynamic circadian sand candle fixture. Perfect for candle morning light and cyclic glowing.
          - Nami Stylus (p6, $95): Walnut writing pencil. Great as a sensory sketching detail.
          
          Respond in close visual style: calm, premium, highly personal. Pick EXACTLY one main product. Describe how their environmental choices align with it in 3 warm, reassuring sentences.`
        }
      ];

      const query = `Analyze this client profile:\n${answerTokens}\nClient raw aesthetic goal statement: "${customAesthetic}". Formulate their custom profile reading and recommend the ideal product by name.`;
      
      const response = await sendMessageToGemini(systemContext, query);
      setAiAnalysis(response);

      // Perform soft matching on product titles to pair object card
      const matched = PRODUCTS.find(p => 
        response.toLowerCase().includes(p.name.toLowerCase()) || 
        response.toLowerCase().includes(p.id.toLowerCase())
      );
      
      // Fallback if no specific match
      setAlignedProduct(matched || PRODUCTS[0]);
    } catch (err) {
      setAiAnalysis("Your profile matches a state of profound stillness. We recommend beginning your journey with our foundational sound sculpture, the Nami Harmony.");
      setAlignedProduct(PRODUCTS[0]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setCustomAesthetic('');
    setAiAnalysis('');
    setAlignedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C2A26]/40 backdrop-blur-md px-6 py-12">
      
      <div className="bg-[#F5F2EB] border border-[#D6D1C7] w-full max-w-2xl shadow-2xl relative flex flex-col p-8 md:p-12 overflow-hidden mx-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Indicator Progress bar */}
        {currentStep <= 3 && (
          <div className="flex items-center gap-2 mb-8">
            <div className="flex gap-1 flex-1">
              {[0, 1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1 flex-1 transition-all ${
                    currentStep >= s ? 'bg-[#2C2A26]' : 'bg-[#D6D1C7]/40'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#A8A29E] uppercase tracking-widest font-semibold font-mono">
              Step {currentStep + 1} of 4
            </span>
          </div>
        )}

        {/* Dynamic Inner Step views */}

        {/* Question blocks */}
        {currentStep < 3 && (
          <div className="space-y-8 animate-fade-in-up flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#A8A29E] tracking-widest">Nami Sensory Assessment</span>
              <h3 className="text-2xl md:text-3xl font-serif text-[#2C2A26] leading-tight">
                {QUIZ_QUESTIONS[currentStep].text}
              </h3>
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS[currentStep].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full text-left p-5 border border-[#D6D1C7] bg-white/40 hover:bg-white hover:border-[#2C2A26] transition-all duration-300 flex flex-col gap-1.5 focus:outline-none"
                >
                  <span className="font-serif text-sm font-medium text-[#2C2A26]">{opt.text}</span>
                  <span className="text-xs text-[#5D5A53] font-light leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Optional custom manifesting text input */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-in-up flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#A8A29E] tracking-widest">Final Atmospheric touch</span>
              <h3 className="text-2xl md:text-3xl font-serif text-[#2C2A26] leading-tight">
                What sensory aspiration or quiet intention would you like this object to help you realize?
              </h3>
              <p className="text-xs text-[#5D5A53] font-light">Describe in your own calming words (e.g., "Warm candlelight for evening drawings", "Absolute focus in study sessions").</p>
            </div>

            <div className="space-y-6">
              <textarea
                rows={3}
                value={customAesthetic}
                onChange={(e) => setCustomAesthetic(e.target.value)}
                placeholder="Share your aesthetic intention..."
                className="w-full bg-white border border-[#D6D1C7] focus:border-[#2C2A26] outline-none p-4 text-sm text-[#2C2A26] resize-none"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3.5 border border-[#D6D1C7] text-[#2C2A26] uppercase tracking-widest text-[10px] font-bold hover:bg-[#EBE7DE]"
                >
                  Previous
                </button>
                <button
                  onClick={handleTriggerAnalysis}
                  className="flex-1 py-3.5 bg-[#2C2A26] hover:bg-[#433E38] text-white uppercase tracking-widest text-[10px] font-bold transition-all shadow-md"
                >
                  Generate Tactile Profile Reading
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Loading Cryptography Progress or recommendation card readings */}
        {currentStep === 4 && (
          <div className="space-y-8 flex-1 flex flex-col justify-center overflow-y-auto no-scrollbar py-2">
            
            {/* Active loading state */}
            {isAnalyzing ? (
              <div className="text-center py-12 space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-[#2C2A26]/5 rounded-full animate-ping duration-[2000ms]"></div>
                  <div className="w-10 h-10 bg-[#2C2A26] rounded-full flex items-center justify-center shadow-lg">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif italic text-lg text-[#2C2A26]">Analyzing environmental wavelengths...</h4>
                  <p className="text-xs text-[#A8A29E] font-light italic">Calculating materials compatibility, tactile textures and atomic focus coordinates...</p>
                </div>
              </div>
            ) : (
              // Results Display Area
              <div className="space-y-6 animate-fade-in-up">
                
                {/* AI Text alignment reading block */}
                <div className="border-l-2 border-[#2C2A26] pl-6 space-y-3">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#A8A29E]">Tactile Profiler Reading</span>
                  <p className="font-serif leading-relaxed text-[#2C2A26] text-base md:text-lg italic">
                    "{aiAnalysis}"
                  </p>
                </div>

                {/* Highlight/Render recommended physical product cards */}
                {alignedProduct && (
                  <div className="p-4 bg-white/60 border border-[#D6D1C7] flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-between">
                    <div className="flex gap-4 items-center sm:items-start">
                      <div className="w-16 h-20 bg-[#EBE7DE] overflow-hidden flex-shrink-0">
                        <img src={alignedProduct.imageUrl} alt={alignedProduct.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[9px] uppercase font-bold text-[#A8A29E] tracking-widest">{alignedProduct.category}</span>
                        <h4 className="font-serif text-[#2C2A26] text-sm font-semibold">{alignedProduct.name}</h4>
                        <p className="text-xs text-[#5D5A53] font-light max-w-md line-clamp-1">{alignedProduct.tagline}</p>
                        <span className="text-xs font-semibold text-[#2C2A26] block pt-1 font-mono">${alignedProduct.price}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        onClose();
                        onViewProduct(alignedProduct);
                        // Safe scroll to top
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="px-4 py-2 bg-[#2C2A26] text-white hover:bg-[#433E38] uppercase tracking-widest text-[9px] font-bold transition-all w-full sm:w-auto text-center"
                    >
                      Explore Object
                    </button>
                  </div>
                )}

                {/* Footer Buttons selection */}
                <div className="flex gap-4 border-t border-[#D6D1C7]/40 pt-4">
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-3 border border-[#D6D1C7] text-[#2C2A26] hover:bg-[#EBE7DE] uppercase tracking-widest text-[9px] font-bold transition-colors"
                  >
                    Assess Again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-[#2C2A26] hover:bg-[#433E38] text-white uppercase tracking-widest text-[9px] font-bold transition-colors shadow-sm text-center"
                  >
                    Accept Reading & Close
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    
    </div>
  );
};

export default StyleQuiz;
