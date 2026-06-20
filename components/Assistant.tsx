import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product, ViewState } from '../types';
import { sendMessageToGemini, ChatAction } from '../services/geminiService';
import { PRODUCTS } from '../constants';
import { 
  Sparkles, X, Mic, MicOff, Volume2, VolumeX, Send, 
  ShoppingBag, CreditCard, Eye, RefreshCw, Layers 
} from 'lucide-react';

interface AssistantProps {
  onNavigate?: (view: ViewState) => void;
  onAddToCart?: (product: Product) => void;
  cartItems?: Product[];
  currentView?: ViewState;
}

// Organic synthesis for ambient interaction cues aligned with Nami's brand identity
const playAmbientSound = (type: 'listen-start' | 'listen-end' | 'success') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'listen-start') {
      // Soft ascending crystalline dual-resonance glass chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Brand aligned frequencies: E5 (659.25 Hz) and B5 (987.77 Hz)
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.35); // Soft ramp to solid G5

      osc2.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.35); // Harmony to C6

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.08); // Tender attack to avoid clicks
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7); // Long delicate tail

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
    } else if (type === 'listen-end') {
      // Organic resolution chime (E4 -> A3)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(220.00, ctx.currentTime + 0.2); 

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'success') {
      // Serene major-seventh warm wellness arpeggio (A4 -> C#5 -> E5 -> G#5)
      const frequencies = [440.00, 554.37, 659.25, 830.61];
      const gainNode = ctx.createGain();

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const delay = idx * 0.05; // Elegant gentle arpeggiation delay
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        osc.connect(gainNode);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + 1.4);
      });

      gainNode.connect(ctx.destination);
    }
  } catch (e) {
    console.warn("AudioContext was blocked or unsupported in current environment:", e);
  }
};

const Assistant: React.FC<AssistantProps> = ({
  onNavigate,
  onAddToCart,
  cartItems = [],
  currentView
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: 'Greetings, I am your Nami Concierge. I can help you select objects, add items to your cart, or prefill details and transport you directly to checkout ("order palace") whenever you are ready. How may I guide you?', 
      timestamp: Date.now() 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);
  const [micAmplitude, setMicAmplitude] = useState(0.1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Real-time microphone amplitude analysis
  useEffect(() => {
    if (isListening) {
      let active = true;
      let micStream: MediaStream | null = null;
      let analyser: AnalyserNode | null = null;
      let dataArray: Uint8Array;
      let source: MediaStreamAudioSourceNode | null = null;

      const handleMicLevel = () => {
        if (!active) return;
        if (analyser) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Smoothly map from 0-110 range into a normalized 0.1 - 1.2 responsive amplitude modifier
          const amplitudeValue = Math.min(Math.max((average / 110) + 0.1, 0.1), 1.2);
          setMicAmplitude(amplitudeValue);
        } else {
          // Dynamic aesthetic heartbeat simulation loop as immediate, offline-ready fallback
          setMicAmplitude(0.15 + Math.sin(Date.now() / 120) * 0.35 + Math.random() * 0.15);
        }
        animationFrameIdRef.current = requestAnimationFrame(handleMicLevel);
      };

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          if (!active) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          micStream = stream;
          audioStreamRef.current = stream;
          
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            analyser = ctx.createAnalyser();
            analyser.fftSize = 64; 
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
          }
          handleMicLevel();
        })
        .catch(err => {
          console.warn("Microphone access for live meter restricted, initializing organic visual nami simulation fallback:", err);
          handleMicLevel();
        });

      return () => {
        active = false;
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        if (micStream) {
          micStream.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
      };
    } else {
      setMicAmplitude(0);
    }
  }, [isListening]);

  // Initialize Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        setLastActionStatus("Listening to your voice...");
        playAmbientSound('listen-start');
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (final) {
          setInputValue(prev => {
            const separator = prev ? ' ' : '';
            return prev + separator + final;
          });
          setInterimTranscript('');
        } else if (interim) {
          setInterimTranscript(interim);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        setLastActionStatus("Voice capture paused.");
        setTimeout(() => setLastActionStatus(null), 3000);
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        playAmbientSound('listen-end');
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isThinking]);

  // Handle Text-to-Speech (TTS)
  const speakText = (textToSpeak: string) => {
    if (!voiceEnabled) return;
    try {
      // Cancel active voice playbacks
      window.speechSynthesis.cancel();
      
      // Clean markdown bold symbols and extra tags before speaking
      const cleaned = textToSpeak
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/#+/g, '');
        
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      
      // Attempt to pick a smooth native voice if available
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Natural") || v.name.includes("Samantha"));
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis issue:", e);
    }
  };

  const toggleVoiceCapture = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not fully supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const executeTargetAction = (action: ChatAction) => {
    const { type, payload } = action;
    if (!type || type === 'NONE') return;

    try {
      switch (type) {
        case 'ADD_TO_CART': {
          const prodId = payload?.productId;
          if (!prodId) return;
          const targetProduct = PRODUCTS.find(p => p.id === prodId);
          if (targetProduct) {
            if (onAddToCart) {
              onAddToCart(targetProduct);
              setLastActionStatus(`Added "${targetProduct.name}" to cart.`);
              playAmbientSound('success');
              setTimeout(() => setLastActionStatus(null), 5000);
            }
          }
          break;
        }

        case 'GO_TO_CHECKOUT': {
          if (onNavigate) {
            const disc = payload?.promoCode === 'NAMI10' ? 40 : payload?.promoCode === 'SERENE20' ? 80 : payload?.promoCode === 'SPRING50' ? 50 : 0;
            onNavigate({
              type: 'checkout',
              discount: disc,
              promoCode: payload?.promoCode,
              prefill: payload?.prefill
            });
            setLastActionStatus("Navigated to secure checkout.");
            playAmbientSound('success');
            setTimeout(() => setLastActionStatus(null), 5000);
          }
          break;
        }

        case 'VIEW_PRODUCT': {
          const prodId = payload?.productId;
          if (!prodId) return;
          const targetProduct = PRODUCTS.find(p => p.id === prodId);
          if (targetProduct && onNavigate) {
            onNavigate({ type: 'product', product: targetProduct });
            setLastActionStatus(`Viewing details of "${targetProduct.name}".`);
            playAmbientSound('success');
            setTimeout(() => setLastActionStatus(null), 4000);
          }
          break;
        }

        case 'VIEW_ORDERS': {
          if (onNavigate) {
            onNavigate({ type: 'orders' });
            setLastActionStatus("Opened order history logs.");
            playAmbientSound('success');
            setTimeout(() => setLastActionStatus(null), 4000);
          }
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.error("Action error:", e);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);
    setLastActionStatus("Formulating curation alignment...");

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const result = await sendMessageToGemini(history, userText);
      
      const aiMsg: ChatMessage = { role: 'model', text: result.text, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setLastActionStatus(null);

      // Speak text aloud automatically
      speakText(result.text);

      // Execute extracted model actions
      if (result.actions && result.actions.length > 0) {
        result.actions.forEach(action => {
          executeTargetAction(action);
        });
      }
    } catch (error) {
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: 'I apologize, but we seem to be having trouble reaching our catalog gateway. Please check again in a moment.', 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="bg-[#F4F1EA] rounded-none shadow-2xl shadow-[#2C2A26]/20 w-[95vw] sm:w-[420px] h-[600px] mb-6 flex flex-col overflow-hidden border border-[#D5D0C5] animate-slide-up-fade">
          
          {/* Header */}
          <div className="bg-[#EBE6DA] px-5 py-4 border-b border-[#D5D0C5] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? 'bg-[#10B981]' : 'bg-[#A34E36]'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isListening ? 'bg-[#10B981]' : 'bg-[#A34E36]'}`}></span>
              </span>
              <div>
                <span className="font-serif italic font-semibold text-[#2C2A26] text-lg block">Concierge Desk</span>
                <span className="text-[10px] text-[#A8A29E] uppercase tracking-widest font-mono">
                  {isListening ? "🎤 Hands-Free Mode Active" : "Talk & Order Assistant"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice output toggle */}
              <button 
                onClick={() => {
                  const val = !voiceEnabled;
                  setVoiceEnabled(val);
                  if (!val) window.speechSynthesis.cancel();
                }}
                className={`p-1.5 rounded-full border transition-colors ${
                  voiceEnabled 
                    ? 'border-[#2C2A26]/10 text-[#A34E36] bg-white' 
                    : 'border-transparent text-[#A8A29E] hover:text-[#2C2A26]'
                }`}
                title={voiceEnabled ? "Mute reading voice" : "Enable speaking voice"}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 text-[#A8A29E] hover:text-[#2C2A26] transition-colors rounded-full hover:bg-[#E3DDCF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action notification banner */}
          {lastActionStatus && (
            <div className="bg-[#2C2A26] text-[#F5F2EB] px-5 py-2 text-xs font-serif italic text-center flex items-center justify-center gap-2 border-b border-stone-800 transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5 text-[#EBE6DA] animate-pulse" />
              <span>{lastActionStatus}</span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F4F1EA]" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col space-y-1 max-w-[85%]">
                  <div 
                    className={`p-4 text-xs md:text-sm leading-relaxed border-none ${
                      msg.role === 'user' 
                        ? 'bg-[#211F1D] text-[#F5F2EB]' 
                        : 'bg-white text-[#4A4740] shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-2 px-1">
                      <button 
                        onClick={() => speakText(msg.text)}
                        className="text-[10px] text-[#A8A29E] hover:text-[#2C2A26] flex items-center gap-1 font-mono hover:underline"
                      >
                        <Volume2 className="w-3 h-3" /> Speak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white p-4 flex gap-1.5 items-center shadow-sm animate-pulse">
                  <div className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}

            {isListening && (
              <div className="sticky bottom-2 left-0 right-0 flex justify-center pointer-events-none z-20">
                <div className="bg-[#211F1D] text-white px-5 py-4 shadow-2xl flex flex-col items-center gap-3.5 border border-stone-800 rounded-2xl pointer-events-auto max-w-[92%] transition-all duration-300">
                  <div className="flex items-center gap-5">
                    {/* Dynamic Responsive Waveform Bars */}
                    <div className="flex items-end justify-center gap-1 h-8 px-1.5 border-r border-stone-800 pr-4">
                      {[0.3, 0.6, 0.9, 1.2, 1.4, 1.2, 0.9, 0.6, 0.3].map((factor, i) => {
                        const heightVal = Math.max(4, Math.min(32, micAmplitude * factor * 26));
                        return (
                          <span
                            key={i}
                            className="w-[3px] bg-[#10B981] rounded-full transition-all duration-75"
                            style={{ height: `${heightVal}px` }}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Concentric voice ripples surrounding microphone icon */}
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#10B981]/10">
                        <span 
                          className="absolute inset-0 rounded-full bg-[#10B981]/20 transition-transform duration-75"
                          style={{ transform: `scale(${1 + micAmplitude * 1.5})` }}
                        />
                        <span 
                          className="absolute inset-0 rounded-full bg-[#10B981]/10 transition-transform duration-100 delay-30"
                          style={{ transform: `scale(${1 + micAmplitude * 2.5})` }}
                        />
                        <Mic className="w-4 h-4 text-[#10B981] relative z-10" />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-mono font-semibold text-[#EBE6DA]">
                          {interimTranscript ? "Hearing voice..." : "AI Listening..."}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-[#10B981] mt-0.5 animate-pulse">
                          Amplitude: {Math.round(micAmplitude * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual live dictation subtitle preview */}
                  <div className="text-center px-1 border-t border-stone-800/60 pt-2 w-full">
                    <p className="text-[11px] italic text-[#10B981] font-serif max-w-xs break-words">
                      {interimTranscript ? `"${interimTranscript}"` : "e.g., 'choose Nami Epoch for me and add to cart'"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Input controls */}
          <div className="p-4 bg-[#EBE6DA] border-t border-[#D5D0C5] space-y-3">
            
            {/* Direct ordering quick action helpers */}
            <div className="flex gap-2 overflow-x-auto pb-1 invisible-scrollbar">
              <button 
                onClick={() => {
                  setInputValue("Recommend a product and add it to my cart");
                }}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-[#F4F1EA] text-[10px] font-mono tracking-wider text-[#2C2A26] border border-[#D5D0C5]"
              >
                ➕ Auto Recommendation
              </button>
              <button 
                onClick={() => {
                  setInputValue("Take me to the checkout palace to pay");
                }}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-[#F4F1EA] text-[10px] font-mono tracking-wider text-[#2C2A26] border border-[#D5D0C5]"
              >
                💳 Checkout Now
              </button>
            </div>

            <div className="flex gap-2 items-center">
              {/* Mic Icon for Voice capture */}
              <button
                type="button"
                onClick={toggleVoiceCapture}
                className={`p-3 border transition-all relative overflow-hidden ${
                  isListening 
                    ? 'bg-[#A34E36] border-[#A34E36] text-white' 
                    : 'bg-white border-[#D5D0C5] text-[#2C2A26] hover:bg-stone-50'
                }`}
                title={isListening ? "Listening... click to pause" : "Dictate with your voice"}
                style={isListening ? { transform: `scale(${1 + micAmplitude * 0.1})` } : undefined}
              >
                {isListening && (
                  <>
                    <span 
                      className="absolute inset-0 bg-white/20 transition-transform duration-75 rounded-full"
                      style={{ transform: `scale(${micAmplitude * 3})` }}
                    />
                    <span 
                      className="absolute inset-0 bg-[#10B981]/25 transition-transform duration-100 rounded-full"
                      style={{ transform: `scale(${micAmplitude * 2})` }}
                    />
                  </>
                )}
                <span className="relative z-10">
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </span>
              </button>

              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Tell us what you want to order..."} 
                className="flex-1 bg-white border border-[#D5D0C5] focus:border-[#2C2A26] px-4 py-3 text-xs md:text-sm outline-none transition-colors placeholder-[#A8A29E] text-[#2C2A26]"
              />

              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isThinking}
                className="bg-[#2C2A26] text-[#F5F2EB] p-3 hover:bg-[#433E38] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[9px] text-[#A8A29E] text-center font-mono uppercase tracking-wider">
              {isListening ? "Recording your voice... say what you want to order" : "Supports bidirectional voice talk and autonomous checkout"}
            </p>
          </div>
        </div>
      )}

      {/* Launcher button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2C2A26] text-[#F5F2EB] w-14 h-14 flex items-center justify-center rounded-full shadow-2xl hover:scale-105 transition-all duration-300 z-50 border border-[#D5D0C5] relative"
        id="voice-order-ai-launcher"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#F5F2EB]" />
        ) : (
          <>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A34E36] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#A34E36]"></span>
            </span>
            <Sparkles className="w-5 h-5 text-[#F5F2EB]" />
          </>
        )}
      </button>
    </div>
  );
};

export default Assistant;
