/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface Material {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  sensoryProfile: string;
  origin: string;
  imageUrl: string;
  compatibleObjects: string[];
}

const MATERIALS: Material[] = [
  {
    id: 'm1',
    name: 'Kyoto Sandstone Composite',
    subtitle: 'Tactile Grounding',
    description: 'Reclaimed sandstone powders combined with biopolymers and baked at moderate warmth. It retains room temperature longer, providing a dense weight and a cooling, textured grain that mimics ancient stone steps.',
    sensoryProfile: 'Mineral grit, cool thermal conductivity, heavy physical presence.',
    origin: 'Reclaimed Quarry Silts, Kyoto Prefectures',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600',
    compatibleObjects: ['Nami Harmony', 'Nami Canvas']
  },
  {
    id: 'm2',
    name: 'Riverstone Polished Ceramic',
    subtitle: 'Vitreous Flow',
    description: 'An ultra-pure ceramic slurry cast in small batches, fired for 36 hours, then tumbled in fine river gravel to remove any sharp mechanical glare. The result is a glass-smooth surface that feels soft on raw skin.',
    sensoryProfile: 'Fluidic gloss, hypoallergenic thermal neutral, frictionless glide.',
    origin: 'Arita Kilns, Saga Prefecture',
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600',
    compatibleObjects: ['Nami Epoch']
  },
  {
    id: 'm3',
    name: 'Organic Flax acoustic wool',
    subtitle: 'Atmospheric Softness',
    description: 'Sustainable Nordic flax fibers needle-punched into a sound-scattering mat. This light, breathable textile absorbs high-frequency room reflections and diffuses sound, creating a feeling of acoustic shelter.',
    sensoryProfile: 'Open-air ventilation, high friction weave, atmospheric damping.',
    origin: 'Sustainable Agricultural Cooperatives, Sweden',
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600',
    compatibleObjects: ['Nami Harmony']
  },
  {
    id: 'm4',
    name: 'Living Moss Bio-HEPA Filter',
    subtitle: 'Organic Respiration',
    description: 'Cultivated, slow-growing mountain mosses nested upon a micro-structured silver-particle matrix. The moss actively absorbs microscopic organic pollutants while releasing fresh forest moisture and scents.',
    sensoryProfile: 'Earthy dampness, rich wood-rot fragrance, active hydration.',
    origin: 'Botanical Conservatories, Shizuoka Prefecture',
    imageUrl: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&q=80&w=600',
    compatibleObjects: ['Nami Essence']
  }
];

const MaterialShowcase: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(MATERIALS[0].id);

  const activeMaterial = MATERIALS.find(m => m.id === selectedId) || MATERIALS[0];

  return (
    <motion.section 
      id="material-showcase" 
      className="py-24 px-6 md:px-12 bg-[#EBE7DE] border-t border-[#D6D1C7]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-[1800px] mx-auto">
        
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-[0.2em]">Crafted materiality</span>
            <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] leading-tight">
              Tactile landscapes.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg text-[#5D5A53] font-light leading-relaxed max-w-2xl">
              We believe technology shouldn't feel like cold, glass screens and clinical plastic. We explore tactile geology, organic weaves, and soft fibers that age beautifully, transferring physical peace through your fingertips.
            </p>
          </div>
        </div>

        {/* Interactive Material Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Material Selectors (Left Side) */}
          <div className="lg:col-span-4 space-y-4">
            {MATERIALS.map((mat) => (
              <button
                key={mat.id}
                onClick={() => setSelectedId(mat.id)}
                className={`w-full text-left p-6 border transition-all duration-300 flex items-center gap-6 cursor-pointer focus:outline-none ${
                  selectedId === mat.id 
                    ? 'bg-white border-[#2C2A26] shadow-md' 
                    : 'bg-white/40 border-[#D6D1C7] hover:bg-white/80'
                }`}
              >
                {/* Micro Thumbnail */}
                <div className="w-12 h-12 overflow-hidden flex-shrink-0 bg-[#EBE7DE]">
                  <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover grayscale" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-serif font-medium text-[#2C2A26] text-base leading-tight">{mat.name}</h4>
                  <p className="text-xs text-[#A8A29E] tracking-wider uppercase font-light">{mat.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Featured Material Panel (Right Side Showcase) */}
          <div className="lg:col-span-8 bg-white border border-[#D6D1C7] overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-sm min-h-[500px]">
            
            {/* Visual Panel */}
            <div className="relative aspect-[4/5] md:aspect-auto">
              <img 
                src={activeMaterial.imageUrl} 
                alt={activeMaterial.name} 
                className="w-full h-full object-cover grayscale contrast-110 brightness-95 animate-fade-in"
                key={activeMaterial.id} // Forces crossfade on changes
              />
              <div className="absolute inset-0 bg-[#313030]/10" />
            </div>

            {/* Technical Slate / Prose */}
            <div className="p-8 md:p-12 flex flex-col justify-between space-y-8 bg-[#FBF9F6]">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A8A29E]">Active Material Record</span>
                  <h3 className="text-3xl font-serif font-medium text-[#2C2A26] mt-2">{activeMaterial.name}</h3>
                  <p className="text-xs italic text-[#5D5A53] mt-1">Sourced from: {activeMaterial.origin}</p>
                </div>

                <p className="text-sm font-light leading-relaxed text-[#5D5A53]">
                  {activeMaterial.description}
                </p>

                {/* Technical sensory metrics */}
                <div className="border-t border-[#D6D1C7]/50 pt-4 space-y-2">
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-[#2C2A26]">Sensory Signature</span>
                  <p className="text-xs text-[#5D5A53] font-mono leading-relaxed">{activeMaterial.sensoryProfile}</p>
                </div>
              </div>

              {/* Compatible Objects footer */}
              <div className="border-t border-[#D6D1C7]/50 pt-6">
                <span className="block text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-2">Used in Companion Objects</span>
                <div className="flex flex-wrap gap-2">
                  {activeMaterial.compatibleObjects.map(obj => (
                    <span key={obj} className="px-3 py-1 bg-[#2C2A26] text-[#F5F2EB] text-[9px] font-mono uppercase tracking-widest">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </motion.section>
  );
};

export default MaterialShowcase;
