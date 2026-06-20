/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface HeroProps {
  onStartQuiz: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  delay: number;
}

const Hero: React.FC<HeroProps> = ({ onStartQuiz }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate 42 mystical glowing stars / embers / dust particles
    const initialParticles = Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5, // 1.5px to 4.5px
      speedY: Math.random() * 0.4 + 0.1,
      delay: Math.random() * 5,
    }));
    setParticles(initialParticles);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offsetX = (x - centerX) / centerX;
      const offsetY = (y - centerY) / centerY;
      setMouseOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    containerRef.current?.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      try {
        window.history.pushState(null, '', `#${targetId}`);
      } catch (err) {
        // Safe fail in sandbox iframe
      }
    }
  };

  // Parallax calculations
  const textTranslateY = scrollY * 0.15;
  const bgTranslateY = scrollY * 0.3;
  const overlayOpacity = Math.min(0.7, 0.45 + scrollY * 0.001);

  // 3D Parallax coordinate calculations
  const bgTransform = `translate3d(${mouseOffset.x * -24}px, ${bgTranslateY + mouseOffset.y * -24}px, 0) scale(1.15)`;
  const textTransform = `translate3d(${mouseOffset.x * 12}px, ${textTranslateY + mouseOffset.y * 12}px, 0)`;

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen min-h-[800px] overflow-hidden bg-[#2C2A26] select-none"
    >
      {/* Background Image - Cozy, Towering Magical Library with Parallax */}
      <div className="absolute inset-0 w-full h-[125%] origin-center overflow-hidden pointer-events-none select-none">
        <img 
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2000" 
          alt="Magical high-density vertical fantasy library" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale contrast-[0.8] brightness-[0.85] absolute top-[-5%] left-0 transition-transform duration-700 ease-out"
          style={{
            transform: bgTransform,
          }}
        />

        {/* Shimmering Starlit Dust/Embers Particles Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bg-gradient-to-r from-[#DFD5C6] to-[#E5D7C0] rounded-full opacity-60 mix-blend-screen animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transform: `translate3d(${mouseOffset.x * (particle.size * -8)}px, ${-scrollY * 0.15 + (mouseOffset.y * (particle.size * -8))}px, 0)`,
                boxShadow: particle.size > 2.5 ? '0 0 10px rgba(223, 213, 198, 0.8)' : 'none',
                transition: 'transform 0.2s ease-out',
                animationDelay: `${particle.delay}s`,
                animationDuration: `${3 + particle.size}s`,
              }}
            />
          ))}
        </div>

        {/* Dynamic Interactive Nami Spotlight following the cursor */}
        <div 
          className="absolute hidden md:block w-[750px] h-[750px] rounded-full pointer-events-none mix-blend-color-dodge transition-all duration-[1200ms] cubic-bezier(0.1, 0.8, 0.25, 1) opacity-60 blur-[130px] z-10"
          style={{
            background: 'radial-gradient(circle, rgba(223, 213, 198, 0.42) 0%, rgba(118, 132, 110, 0.28) 45%, rgba(163, 78, 54, 0.08) 75%, transparent 100%)',
            left: `${mousePosition.x - 375}px`,
            top: `${mousePosition.y - 375}px`,
          }}
        />

        {/* Ambient background glows for extra visual depth */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#76846E]/15 blur-[120px] mix-blend-overlay pointer-events-none animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#A34E36]/10 blur-[100px] mix-blend-overlay pointer-events-none animate-pulse duration-[15s]"></div>

        {/* Image gradient overlays to secure visual contrast and readability */}
        <div 
          className="absolute inset-0 bg-[#2C2A26]/55 mix-blend-multiply transition-opacity duration-300 z-10"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A26]/95 via-[#2C2A26]/35 to-transparent z-10"></div>
      </div>

      {/* Elegant Architectural Frame borders */}
      <div className="absolute inset-5 sm:inset-8 border border-white/10 pointer-events-none z-20 flex flex-col justify-between">
        <div className="flex justify-between p-4 text-[9px] font-mono tracking-widest text-[#F5F2EB]/40 uppercase">
          <span>NAMI RESONANCE</span>
          <span>SYSTEM INTEGRATION</span>
        </div>
        <div className="flex justify-between p-4 text-[9px] font-mono tracking-widest text-[#F5F2EB]/40 uppercase">
          <span>COORDINATE ALIGNMENT</span>
          <span>EST. 2026</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-25 h-full flex flex-col justify-center items-center text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
          style={{
            transform: textTransform,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Collection Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F5F2EB]/10 backdrop-blur-md border border-white/20 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-[#76846E] rounded-full animate-ping"></span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#F5F2EB]">
              Spring Collection 2026
            </span>
          </motion.div>

          {/* Master title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-normal text-white tracking-tight mb-8 leading-[0.95] drop-shadow-md">
            Quiet <span className="italic font-light text-[#F5F2EB]">resonance.</span>
          </h1>

          {/* Tagline */}
          <p className="max-w-xl mx-auto text-base sm:text-lg md:text-xl text-[#F5F2EB]/95 font-light leading-relaxed mb-12">
            Tactile technology designed to dissolve into your living space. <br className="hidden sm:inline"/>
            Organic materials, acoustic silence, balanced form.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#products" 
              onClick={(e) => handleNavClick(e, 'products')}
              className="w-full sm:w-auto px-10 py-3.5 bg-[#F5F2EB] hover:bg-white text-[#2C2A26] rounded-lg text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] transform active:scale-95 text-center"
            >
              View Collection
            </a>

            <button 
              onClick={onStartQuiz}
              className="w-full sm:w-auto px-10 py-3.5 bg-transparent hover:bg-[#F5F2EB] border border-white/30 hover:border-[#F5F2EB] text-[#F5F2EB] hover:text-[#2C2A26] rounded-lg text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 transform active:scale-95"
            >
              Discover Your Nami
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Scroll Down Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={(e) => handleNavClick(e as any, 'products')}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 group z-25 text-white"
      >
        <span className="text-[9px] font-mono tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
          Scroll
        </span>
        <div className="w-[1.5px] h-12 bg-white/25 rounded-full overflow-hidden relative">
          <motion.div 
            animate={{
              y: [-12, 38],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-full h-3 bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
