import React from 'react';
import { RiskAssessmentData } from '../../types/risk';
import { RiskCard } from './RiskCard';
import { ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { Badge } from '../common/Badge';

interface RiskAssessmentProps {
  assessment: RiskAssessmentData;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ assessment }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Environmental Risk
            </h2>
            <Badge variant="primary" size="sm">
              Deterministic Risk Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-referenced clinical vulnerability weights mapped against atmospheric parameters
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span>Compound Index Model</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pollution Risk */}
        <RiskCard
          categoryName="Pollution Risk"
          riskLevel={assessment.pollutionRisk}
          result={assessment.details.pollution}
        />

        {/* 2. Heat Risk */}
        <RiskCard
          categoryName="Heat Risk"
          riskLevel={assessment.heatRisk}
          result={assessment.details.heat}
        />

        {/* 3. UV Risk */}
        <RiskCard
          categoryName="UV Risk"
          riskLevel={assessment.uvRisk}
          result={assessment.details.uv}
        />

        {/* 4. Overall Risk */}
        <RiskCard
          categoryName="Overall Risk"
          riskLevel={assessment.overallRisk}
          result={assessment.details.overall}
          isOverall
        />
      </div>
    </div>
  );
};
