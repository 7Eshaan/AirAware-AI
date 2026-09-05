import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

export interface GlobeLoaderProps {
  isGlobeReady: boolean;
  onStartReveal?: () => void;
  onFinished?: () => void;
}

export const GlobeLoader: React.FC<GlobeLoaderProps> = ({
  isGlobeReady,
  onStartReveal,
  onFinished,
}) => {
  const { progress, total } = useProgress();
  const [isVisible, setIsVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const revealTriggeredRef = useRef(false);

  // Strictly controlled progress interpolation:
  // Progress is capped at 94% until isGlobeReady is true (meaning WebGL has rendered real frames).
  useEffect(() => {
    let target = 0;
    if (isGlobeReady) {
      target = 100;
    } else if (total > 0) {
      // Drei is downloading assets: smoothly advance up to 94% max
      target = Math.min(94, Math.round(progress || 0));
    } else {
      // Initial startup handshake
      target = Math.min(25, displayProgress + 1);
    }

    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const increment = target - prev > 15 ? 2 : 1;
          return Math.min(target, prev + increment);
        }
        return prev;
      });
    }, 18);

    return () => clearInterval(timer);
  }, [progress, total, isGlobeReady, displayProgress]);

  // Once both 100% display progress AND isGlobeReady are satisfied, begin exit dissolve
  useEffect(() => {
    if (displayProgress >= 100 && isGlobeReady && !revealTriggeredRef.current) {
      revealTriggeredRef.current = true;

      // Brief satisfying 280ms hold at 100% before starting dissolve
      const revealTimer = setTimeout(() => {
        onStartReveal?.();
        setIsVisible(false);
      }, 280);

      return () => clearTimeout(revealTimer);
    }
  }, [displayProgress, isGlobeReady, onStartReveal]);

  // Safety fallback (12 seconds) in case of unexpected network stall
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!revealTriggeredRef.current) {
        setDisplayProgress(100);
      }
    }, 12000);

    return () => clearTimeout(safetyTimer);
  }, []);

  const getPhaseCode = (pct: number) => {
    if (pct < 25) return '01 //';
    if (pct < 60) return '02 //';
    if (pct < 94) return '03 //';
    if (pct < 100) return '04 //';
    return '05 //';
  };

  const getPhaseLabel = (pct: number, ready: boolean) => {
    if (pct < 25) return 'INITIALIZING SATELLITE TELEMETRY LINK';
    if (pct < 60) return 'STREAMING 12,756 KM HIGH-RES TOPOGRAPHY';
    if (pct < 94) return 'COMPILING ATMOSPHERIC RAYLEIGH SHADERS';
    if (!ready || pct < 100) return 'FINALIZING GPU WEBGL RENDER BUFFER';
    return 'PLANETARY BIOSPHERE STABILIZED';
  };

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: 'blur(12px)',
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] text-white select-none overflow-hidden pointer-events-auto"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(6, 78, 59, 0.22) 0%, rgba(2, 6, 23, 0.9) 60%, #020617 100%)',
          }}
        >
          {/* Deep Space Ambient Nebular Glows */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/12 blur-[130px] pointer-events-none -top-20 -left-20" />
          <div className="absolute w-[450px] h-[450px] rounded-full bg-cyan-500/12 blur-[120px] pointer-events-none -bottom-20 -right-20" />

          {/* Minimal Observatory Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono tracking-[0.28em] uppercase mb-10 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
            <span>AirAware // Orbital Biosphere Observatory</span>
          </div>

          {/* Centered Ball with Fast Spinning Luminous Trail */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Ambient Atmospheric Glow Behind Ball */}
            <motion.div
              animate={{
                scale: [0.95, 1.1, 0.95],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-cyan-400/25 blur-2xl pointer-events-none"
            />

            {/* Subtle Orbital Guide Ring */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 pointer-events-none" />

            {/* Fast Spinning Luminous Comet Trail */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.0, ease: 'linear' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #ffffff 0deg, #34d399 20deg, #06b6d4 50deg, rgba(6, 182, 212, 0.4) 100deg, transparent 160deg, transparent 360deg)',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 3.5px), #fff calc(100% - 3px))',
                mask:
                  'radial-gradient(farthest-side, transparent calc(100% - 3.5px), #fff calc(100% - 3px))',
              }}
            />

            {/* Fast Spinning Leading Spark Bead */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.0, ease: 'linear' }}
              className="absolute inset-0 rounded-full pointer-events-none"
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_14px_#34d399,0_0_26px_#22d3ee,0_0_38px_#06b6d4]" />
            </motion.div>

            {/* Centered Planetary Ball */}
            <motion.div
              animate={{
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-[#0b1c2e] via-[#050f1a] to-[#020617] border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.3),inset_0_2px_14px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden"
            >
              {/* Internal atmospheric limb lighting */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-emerald-500/10 to-emerald-400/25 pointer-events-none" />

              {/* Minimalist central Earth coordinates reticle */}
              <svg
                className="w-18 h-18 sm:w-22 sm:h-22 text-emerald-400/25 stroke-current"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle cx="50" cy="50" r="46" strokeWidth="1" strokeDasharray="2 3" />
                <ellipse cx="50" cy="50" rx="46" ry="18" strokeWidth="1" />
                <ellipse cx="50" cy="50" rx="18" ry="46" strokeWidth="1" />
                <line x1="50" y1="4" x2="50" y2="96" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="4" y1="50" x2="96" y2="50" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </motion.div>
          </div>

          {/* Crisp, Satisfying Progress Metric Section */}
          <div className="mt-10 text-center flex flex-col items-center">
            {/* 3-Digit Tabular Counter */}
            <div className="font-mono text-4xl sm:text-5xl font-light tracking-[0.18em] text-white flex items-baseline gap-1">
              <span>{String(displayProgress).padStart(3, '0')}</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono tracking-normal">%</span>
            </div>

            {/* Sleek Luminous Neon Progress Bar with Gliding Leading Bead */}
            <div className="mt-4 w-64 sm:w-76 h-[3px] bg-slate-800/90 rounded-full overflow-hidden p-0 relative shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_16px_rgba(52,211,153,0.9)] transition-all duration-150 relative"
                style={{ width: `${displayProgress}%` }}
              >
                {/* Gliding leading spark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#34d399]" />
              </motion.div>
            </div>

            {/* Structured Multi-Phase Telemetry Indicator */}
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono tracking-wider">
              <span className="text-emerald-400 font-bold">{getPhaseCode(displayProgress)}</span>
              <span className="text-slate-300 transition-colors duration-300">
                {getPhaseLabel(displayProgress, isGlobeReady)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
