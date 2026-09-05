import React from 'react';
import { motion } from 'framer-motion';
import { AIAdvisory } from '../../types/advisory';
import { Bot, Sparkles, CheckCircle, XCircle, Clock, Droplets, Shield } from 'lucide-react';

interface AIAdvisoryPanelProps {
  data: AIAdvisory;
}

export const AIAdvisoryPanel: React.FC<AIAdvisoryPanelProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:max-w-[340px] shrink-0 p-3.5 rounded-2xl bg-slate-950/75 border border-emerald-500/25 backdrop-blur-xl shadow-2xl text-white pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>AI Health Advisory</span>
              <Sparkles className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="text-[9px] text-emerald-400 font-medium">
              {data.modelIdentifier}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Clinical</span>
        </div>
      </div>

      {/* Main Narrative Summary */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed mb-2.5">
        <div className="font-bold text-emerald-400 text-xs mb-1">
          {data.headline}
        </div>
        <p className="text-slate-300/90 text-[11px] leading-relaxed">{data.summary}</p>
      </div>

      {/* Recommended Safe Window Banner */}
      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-[8px] text-emerald-400/80 uppercase tracking-wider font-semibold">
              Recommended Safe Window
            </div>
            <div className="font-bold text-white text-xs mt-0.5">
              {data.safeOutdoorWindows[0] || 'Early Morning'}
            </div>
          </div>
        </div>
        {data.safeOutdoorWindows[1] && (
          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
            Alt: {data.safeOutdoorWindows[1]}
          </span>
        )}
      </div>

      {/* Quick Indicators: Hydration & Mask */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
          <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Droplets className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Hydration</div>
            <div className="font-bold text-white text-xs mt-0.5">
              {data.hydrationTargetLiters} L / day
            </div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
          <div className="p-1 rounded-lg bg-teal-500/20 text-teal-400">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Protection</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">
              {data.maskRecommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Actions & Activities to Avoid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1.5">
          <div className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Actions</span>
          </div>
          <div className="space-y-1.5">
            {data.recommendedActions.slice(0, 2).map((act, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200 text-[10px] leading-snug flex items-start gap-1.5"
              >
                <span className="h-1 w-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold text-rose-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Avoid</span>
          </div>
          <div className="space-y-1.5">
            {data.considerAvoiding.slice(0, 2).map((av, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-200 text-[10px] leading-snug flex items-start gap-1.5"
              >
                <span className="h-1 w-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{av}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
