import React from 'react';
import { motion } from 'framer-motion';
import { RiskAssessmentData } from '../../types/risk';
import { RiskBadge } from '../risk/RiskBadge';
import { Activity, ShieldAlert } from 'lucide-react';

interface RiskPanelProps {
  data: RiskAssessmentData;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:max-w-[330px] shrink-0 p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-xl shadow-2xl text-white pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Health Risk Analysis
            </div>
            <div className="text-[9px] text-slate-400">Clinical Deterministic Engine</div>
          </div>
        </div>
        <RiskBadge level={data.overallRisk} size="sm" />
      </div>

      {/* 4 Risk Categories */}
      <div className="space-y-1.5 text-xs">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white text-xs">Pollution Risk</div>
            <div className="text-[9px] text-slate-400 truncate max-w-[150px]">
              {data.details.pollution.primaryConcern}
            </div>
          </div>
          <RiskBadge level={data.pollutionRisk} size="sm" />
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white text-xs">Heat Stress Risk</div>
            <div className="text-[9px] text-slate-400 truncate max-w-[150px]">
              {data.details.heat.primaryConcern}
            </div>
          </div>
          <RiskBadge level={data.heatRisk} size="sm" />
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="font-semibold text-white text-xs">UV Solar Risk</div>
            <div className="text-[9px] text-slate-400 truncate max-w-[150px]">
              {data.details.uv.primaryConcern}
            </div>
          </div>
          <RiskBadge level={data.uvRisk} size="sm" />
        </div>

        <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>Compound Overall Risk</span>
            </div>
            <div className="text-[9px] text-emerald-300">
              Score: {data.details.overall.score}/100
            </div>
          </div>
          <RiskBadge level={data.overallRisk} size="sm" />
        </div>
      </div>
    </motion.div>
  );
};
