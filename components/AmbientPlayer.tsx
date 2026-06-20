/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';

interface SoundChannel {
  id: string;
  name: string;
  subtitle: string;
  defaultVolume: number;
  frequency?: number;
  type?: 'drone' | 'noise' | 'friction';
  color: string;
}

const CHANNELS: SoundChannel[] = [
  { id: 'c1', name: 'Grounded Zen Drone', subtitle: '110Hz Sub-harmony', defaultVolume: 30, frequency: 110, type: 'drone', color: '#43413E' },
  { id: 'c2', name: 'Kyoto Forest Breeze', subtitle: 'Filtered low-pass sea', defaultVolume: 20, type: 'noise', color: '#949B8E' },
  { id: 'c3', name: 'River Stone Friction', subtitle: 'Granular rock gravel', defaultVolume: 10, type: 'friction', color: '#8C8881' }
];

const AmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>({
    c1: 30,
    c2: 20,
    c3: 10
  });

  const [activeFrequencyWave, setActiveFrequencyWave] = useState(110);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Web Audio Context refs for offline synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, { gainNode: GainNode; sourceNode?: any }> | null>(null);
  const animatorRef = useRef<number | null>(null);

  // Initialize nodes only when requested to avoid audio block warning on page load
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const nodes: Record<string, { gainNode: GainNode; sourceNode?: any }> = {};

      // 1. Core Deep Healing Drone oscillator
      const osc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(activeFrequencyWave, ctx.currentTime);
      droneGain.gain.setValueAtTime(0, ctx.currentTime); // start silent

      // Soft second harmonic oscillator for depth
      const subOsc = ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(activeFrequencyWave * 1.5, ctx.currentTime);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(droneGain).connect(ctx.destination);
      subOsc.connect(subGain).connect(ctx.destination);
      
      osc.start();
      subOsc.start();

      nodes['c1'] = { gainNode: droneGain, sourceNode: { osc, subOsc, subGain } };

      // 2. Forest Breeze Noise Source
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Seed white noise values
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Add intense Low Pass Filter for soft "breathing" wind feel
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, ctx.currentTime);
      lowpass.Q.setValueAtTime(2.0, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0, ctx.currentTime);

      noiseSource.connect(lowpass).connect(windGain).connect(ctx.destination);
      noiseSource.start();

      // Simple LFO to sweep lowpass frequency slowly to mimic breeze sighing
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow 8-second cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(200, ctx.currentTime); // sweep range

      lfo.connect(lfoGain).connect(lowpass.frequency);
      lfo.start();

      nodes['c2'] = { gainNode: windGain, sourceNode: { noiseSource, lowpass, lfo, lfoGain } };

      // 3. Sandstone Friction / Pebble generator
      const frictionBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const fData = frictionBuffer.getChannelData(0);
      let lastVal = 0.0;
      // Synthesize brown noise (deeper gravel rumble)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        fData[i] = (lastVal + (0.02 * white)) / 1.02;
        lastVal = fData[i];
        fData[i] *= 3.5; // Gain compensation
      }

      const frictionSource = ctx.createBufferSource();
      frictionSource.buffer = frictionBuffer;
      frictionSource.loop = true;

      const frictionFilter = ctx.createBiquadFilter();
      frictionFilter.type = 'bandpass';
      frictionFilter.frequency.setValueAtTime(80, ctx.currentTime);

      const frictionGain = ctx.createGain();
      frictionGain.gain.setValueAtTime(0, ctx.currentTime);

      frictionSource.connect(frictionFilter).connect(frictionGain).connect(ctx.destination);
      frictionSource.start();

      nodes['c3'] = { gainNode: frictionGain, sourceNode: frictionSource };

      nodesRef.current = nodes;
    } catch (err) {
      console.warn("Web Audio Context blocked or unsupported:", err);
    }
  };

  const handleTogglePlay = () => {
    // Lazy initialize standard system on first user click to satisfy security sandbox requirements
    initAudio();

    if (!audioCtxRef.current) {
      // Degrade to pure elegant visual animation if system does not support
      setIsPlaying(!isPlaying);
      return;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);

    // Fade gains up or down smoothly
    const nodes = nodesRef.current;
    if (nodes) {
      const now = audioCtxRef.current.currentTime;
      CHANNELS.forEach(ch => {
        const targetVol = nextPlayState ? volumes[ch.id] / 100 : 0;
        
        // Custom scale to sound pleasant
        const scale = ch.type === 'drone' ? 0.4 : ch.type === 'noise' ? 0.25 : 0.85;
        const fadeTarget = targetVol * scale;

        // Apply linear curve fade
        nodes[ch.id].gainNode.gain.cancelScheduledValues(now);
        nodes[ch.id].gainNode.gain.linearRampToValueAtTime(fadeTarget, now + 1.2);

        // Also fade secondary triangles for drone
        if (ch.id === 'c1' && nodes['c1'].sourceNode) {
          const droneSubGain = nodes['c1'].sourceNode.subGain;
          droneSubGain.gain.cancelScheduledValues(now);
          droneSubGain.gain.linearRampToValueAtTime(fadeTarget * 0.35, now + 1.5);
        }
      });
    }
  };

  const handleVolumeChange = (id: string, value: number) => {
    setVolumes(prev => ({ ...prev, [id]: value }));

    if (isPlaying && audioCtxRef.current && nodesRef.current) {
      const scale = id === 'c1' ? 0.4 : id === 'c2' ? 0.25 : 0.85;
      const fadeTarget = (value / 100) * scale;
      const now = audioCtxRef.current.currentTime;
      
      nodesRef.current[id].gainNode.gain.cancelScheduledValues(now);
      nodesRef.current[id].gainNode.gain.linearRampToValueAtTime(fadeTarget, now + 0.3);

      if (id === 'c1' && nodesRef.current['c1'].sourceNode) {
        nodesRef.current['c1'].sourceNode.subGain.gain.cancelScheduledValues(now);
        nodesRef.current['c1'].sourceNode.subGain.gain.linearRampToValueAtTime(fadeTarget * 0.35, now + 0.4);
      }
    }
  };

  const handleFrequencyShift = (freq: number) => {
    setActiveFrequencyWave(freq);
    if (audioCtxRef.current && nodesRef.current && nodesRef.current['c1']) {
      const now = audioCtxRef.current.currentTime;
      const droneNodes = nodesRef.current['c1'].sourceNode;
      if (droneNodes) {
        droneNodes.osc.frequency.cancelScheduledValues(now);
        droneNodes.osc.frequency.exponentialRampToValueAtTime(freq, now + 0.8);
        
        droneNodes.subOsc.frequency.cancelScheduledValues(now);
        droneNodes.subOsc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.0);
      }
    }
  };

  // Real-time canvas wave generator using elegant sine ripples
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Correctly read responsive dimensions of the box
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        width = canvas.width;
        height = canvas.height;
      }
    };

    // Use safe native resize observer rather than window.innerWidth calculation
    const observer = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }
    
    handleResize();

    let offset = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Map volumes for the ripple waves
      const c1Factor = volumes.c1 / 100;
      const c2Factor = volumes.c2 / 100;

      const activeStateSpeed = isPlaying ? 0.025 : 0.003;
      offset += activeStateSpeed;

      // Outer bounding scale
      const midY = height / 2;

      // Draw Wave 1 (Sub Zen Healing ribbon)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(67, 65, 62, 0.12)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        // Use multi-frequency overlapping for high organic movement
        const freqScalar = (activeFrequencyWave / 110) * 0.005;
        const scale = isPlaying ? (35 + c1Factor * 50) : 10;
        const y = midY + Math.sin(x * freqScalar + offset * 1.2) * scale + Math.cos(x * 0.002 - offset * 0.5) * (scale * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Wave 2 (Forest Wind / Sage color ribbon)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 155, 142, 0.15)';
      ctx.lineWidth = 2.0;
      for (let x = 0; x < width; x++) {
        const scale = isPlaying ? (20 + c2Factor * 40) : 5;
        const y = midY + Math.cos(x * 0.01 + offset) * scale + Math.sin(x * 0.003 - offset * 0.8) * (scale * 0.7);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Wave 3 (Central focus pulse line)
      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? 'rgba(44, 42, 38, 0.4)' : 'rgba(44, 42, 38, 0.15)';
      ctx.lineWidth = 1.0;
      for (let x = 0; x < width; x++) {
        const ambientFlutter = isPlaying ? (Math.random() * 2 * (volumes.c3 / 50)) : 0;
        const scale = isPlaying ? (15 + (volumes.c1 + volumes.c2) * 0.15) : 3;
        const y = midY + Math.sin(x * 0.008 + offset * 2) * scale + ambientFlutter;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animatorRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      observer.disconnect();
      if (animatorRef.current) cancelAnimationFrame(animatorRef.current);
    };
  }, [isPlaying, volumes, activeFrequencyWave]);

  // Cleanup audio contexts on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <section id="ambient-console" className="py-24 px-6 md:px-12 bg-[#F5F2EB] border-t border-[#D6D1C7]">
      <div className="max-w-[1800px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Informational Panel left */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-[0.2em]">Silence & atmosphere</span>
              <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] leading-tight">
                Synthesize <br/><span className="italic">quietude.</span>
              </h2>
            </div>
            
            <p className="text-[#5D5A53] font-light leading-relaxed text-base">
              The Nami workspace doesn't run from the buzz of external networks. Use our offline local sensory mixer to sweep raw low-pass wind, mineral rock chimes, and grounding drones to wrap your room in focus.
            </p>

            {/* Micro FAQ specs */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#D6D1C7]/50 text-xs font-light text-[#5D5A53]">
              <div>
                <h5 className="font-semibold uppercase tracking-wider text-[#2C2A26] mb-1">Web Audio Synth</h5>
                <p>Synthesized locally inside your sandbox client. No external buffers.</p>
              </div>
              <div>
                <h5 className="font-semibold uppercase tracking-wider text-[#2C2A26] mb-1">Attention Ecology</h5>
                <p>Designed to sink below your focus line after 60 seconds.</p>
              </div>
            </div>
          </div>

          {/* Interactive tactile physical mixer console panel */}
          <div className="lg:col-span-7 bg-[#EBE7DE] border border-[#D6D1C7] p-8 md:p-12 shadow-sm flex flex-col gap-8 relative overflow-hidden">
            
            {/* Waveform Canvas Container back background layer */}
            <div className="relative w-full h-32 bg-[#F2EDE2]/60 border border-[#D6D1C7]/40 overflow-hidden select-none">
              <canvas ref={canvasRef} className="absolute inset-0 block"></canvas>
              
              {/* Overlay telemetry labels */}
              <div className="absolute top-3 left-4 text-[9px] uppercase font-mono text-[#A8A29E]">
                Oscilloscope Frequency Profile
              </div>
              <div className="absolute bottom-3 right-4 text-[9px] uppercase font-mono text-[#2C2A26]/80 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#949B8E] animate-pulse' : 'bg-stone-400'}`}></span>
                {isPlaying ? 'Synthetic Feed: Connected' : 'Synth Idle'}
              </div>
            </div>

            {/* Controls panel: Master switch */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FBF9F6] border border-[#D6D1C7] p-6 gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif text-lg font-medium text-[#2C2A26]">Master Atmospheric Switch</h4>
                <p className="text-xs text-[#A8A29E] font-light">Toggle low frequency background harmonics</p>
              </div>

              <button
                onClick={handleTogglePlay}
                className={`px-8 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 w-full sm:w-auto shadow-sm ${
                  isPlaying 
                    ? 'bg-[#A34E36] text-[#F5F2EB] hover:bg-[#853C26]' 
                    : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                }`}
              >
                {isPlaying ? 'Dissolve Silence' : 'Emit Resonance'}
              </button>
            </div>

            {/* Channels controls sliders */}
            <div className="space-y-6">
              {CHANNELS.map((ch) => (
                <div key={ch.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ch.color }}></span>
                      <span className="font-serif text-sm font-medium text-[#2C2A26]">{ch.name}</span>
                      <span className="text-[10px] text-[#A8A29E] font-mono">({ch.subtitle})</span>
                    </div>
                    <span className="text-xs font-mono text-[#2C2A26] font-semibold">{volumes[ch.id]}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumes[ch.id]}
                    onChange={(e) => handleVolumeChange(ch.id, Number(e.target.value))}
                    className="w-full accent-[#2C2A26] h-1 bg-[#D6D1C7] outline-none cursor-ew-resize rounded-lg"
                  />
                </div>
              ))}
            </div>

            {/* Channel-1 subfrequency tuner toggles */}
            <div className="border-t border-[#D6D1C7]/60 pt-6 space-y-4">
              <span className="block text-[10px] uppercase font-bold tracking-widest text-[#2C2A26]">Drone Tuning Hertz</span>
              <div className="grid grid-cols-4 gap-2">
                {[96, 110, 136, 174].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleFrequencyShift(freq)}
                    className={`py-2 text-[10px] font-mono transition-colors border ${
                      activeFrequencyWave === freq 
                        ? 'bg-[#2C2A26] border-[#2C2A26] text-white font-bold' 
                        : 'bg-white/50 border-[#D6D1C7] text-[#5D5A53] hover:border-[#2C2A26]'
                    }`}
                  >
                    {freq} Hz
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default AmbientPlayer;
