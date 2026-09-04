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
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-emerald-500/25 backdrop-blur-xl shadow-2xl text-white pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>AI Personalized Health Advisory</span>
              <Sparkles className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              {data.modelIdentifier}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Clinical Guidance</span>
        </div>
      </div>

      {/* Main Narrative Summary */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed mb-3">
        <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
          <span>{data.headline}</span>
        </div>
        <p>{data.summary}</p>
      </div>

      {/* Quick Indicators: Safe Window, Hydration, Mask */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase">Safe Window</div>
            <div className="font-bold text-white text-[11px] truncate">
              {data.safeOutdoorWindows[0] || 'Early AM'}
            </div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Droplets className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase">Hydration</div>
            <div className="font-bold text-white text-[11px] truncate">
              {data.hydrationTargetLiters} L / day
            </div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase">Mask Advice</div>
            <div className="font-bold text-white text-[11px] truncate">
              {data.maskRecommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Actions & Activities to Reduce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="space-y-1.5">
          <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Recommended Actions</span>
          </div>
          <ul className="space-y-1">
            {data.recommendedActions.slice(0, 2).map((act, i) => (
              <li key={i} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-slate-200 text-[11px] leading-tight">
                {act}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold text-rose-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Activities to Reduce</span>
          </div>
          <ul className="space-y-1">
            {data.considerAvoiding.slice(0, 2).map((av, i) => (
              <li key={i} className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/15 text-slate-200 text-[11px] leading-tight">
                {av}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
