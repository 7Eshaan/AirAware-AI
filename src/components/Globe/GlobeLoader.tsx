import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { Globe, Radio, Sparkles } from 'lucide-react';

export const GlobeLoader: React.FC = () => {
  const { active, progress, total } = useProgress();
  const [isVisible, setIsVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly interpolate progress counter
  useEffect(() => {
    const target = Math.max(displayProgress, Math.min(100, Math.round(progress || 0)));
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) return prev + 1;
        return prev;
      });
    }, 15);
    return () => clearInterval(timer);
  }, [progress, displayProgress]);

  // When loading finishes, wait briefly for shader compilation and smoothly dissolve
  useEffect(() => {
    if (!active && (progress >= 100 || total === 0)) {
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(exitTimer);
    }
  }, [active, progress, total]);

  // Safety maximum display timeout (6 seconds) so the app never hangs
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Dynamic scientific telemetry readout based on progress
  const getTelemetryMessage = () => {
    if (displayProgress < 25) return 'Calibrating deep-space coordinate grid & orbital frame...';
    if (displayProgress < 50) return 'Synthesizing 12,756 km planetary crust & topography...';
    if (displayProgress < 75) return 'Harmonizing atmospheric scattering & Rayleigh cloud layers...';
    if (displayProgress < 95) return 'Synchronizing real-time Copernicus environmental telemetry link...';
    return 'Planetary projection stabilized. Entering orbital view...';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: 'blur(12px)',
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#020617] text-white select-none overflow-hidden"
          style={{ isolation: 'isolate' }}
        >
          {/* Ambient Deep-Space Nebula Glows */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none -top-20 -left-20" />
          <div className="absolute w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none -bottom-20 -right-20" />
          <div className="absolute w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Central Mesmerising Holographic Planetary Core */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-8">
            {/* Outermost Orbit Ring with Beacon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-emerald-500/20 border-dashed"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
            </motion.div>

            {/* Mid Orbit Ring tilted (Opposite direction) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute inset-6 rounded-full border border-cyan-400/25 border-t-cyan-400/80 border-b-cyan-400/80"
            >
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#06b6d4]" />
            </motion.div>

            {/* Elliptical Diagonal Equatorial Ring */}
            <motion.div
              animate={{ rotateZ: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute w-full h-[38%] rounded-full border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              style={{ transform: 'rotateX(68deg) rotateY(-20deg)' }}
            />

            {/* Innermost Atmospheric Pulsing Core */}
            <motion.div
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-md"
            >
              {/* Radial inner atmospheric glow */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-emerald-400/20 via-transparent to-cyan-500/20 animate-pulse" />

              {/* Central Holographic Globe Icon */}
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="relative z-10 text-emerald-400/90"
              >
                <Globe className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.2] drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]" />
              </motion.div>

              {/* Inner Optical Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent absolute" />
              </div>
            </motion.div>

            {/* Orbital Radar Sweep Angle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute inset-2 rounded-full pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(16, 185, 129, 0.18) 0deg, transparent 60deg, transparent 360deg)',
              }}
            />
          </div>

          {/* Branding & Telemetry Header */}
          <div className="text-center max-w-md px-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono tracking-widest uppercase mb-3 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>AirAware Planetary Observatory</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 flex items-center justify-center gap-2">
              <span>Rendering 3D Biosphere</span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 h-6 font-mono transition-all duration-300">
              {getTelemetryMessage()}
            </p>

            {/* Glowing Segmented Progress Bar */}
            <div className="mt-6 w-64 sm:w-80 mx-auto">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>SYNCHRONIZING</span>
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {displayProgress}%
                </span>
              </div>

              <div className="h-2 w-full bg-slate-900/90 rounded-full p-0.5 border border-white/10 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_14px_rgba(16,185,129,0.7)]"
                  style={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* Lower Status Markers */}
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-2 tracking-wider">
                <span>COORD: 28.61° N, 77.20° E</span>
                <span>MODEL: GLB_12756KM</span>
                <span>STATUS: ACTIVE</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
