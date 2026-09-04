import React from 'react';
import { RiskCategoryResult, RiskLevel } from '../../types/risk';
import { Card } from '../common/Card';
import { RiskBadge } from './RiskBadge';
import { getRiskStyle } from '../../utils/riskUtils';
import { AlertTriangle, ShieldCheck, Flame, Sun, Wind, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RiskCardProps {
  categoryName: string;
  riskLevel: RiskLevel;
  result: RiskCategoryResult;
  isOverall?: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  categoryName,
  riskLevel,
  result,
  isOverall = false,
}) => {
  const style = getRiskStyle(riskLevel);

  const getIcon = () => {
    switch (categoryName) {
      case 'Pollution Risk':
        return <Wind className="h-5 w-5 text-current" />;
      case 'Heat Risk':
        return <Flame className="h-5 w-5 text-current" />;
      case 'UV Risk':
        return <Sun className="h-5 w-5 text-current" />;
      case 'Overall Risk':
      default:
        return <Activity className="h-5 w-5 text-current" />;
    }
  };

  return (
    <Card
      variant="elevated"
      className={cn(
        'flex flex-col justify-between border-2 transition-all duration-300 relative overflow-hidden',
        style.borderClass,
        isOverall ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 shadow-md ring-1 ring-slate-200 dark:ring-slate-700' : ''
      )}
    >
      {/* Top Banner */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-xl', style.bgLight, style.bgDark, style.textColor)}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {categoryName}
              </h3>
              <span className="text-[11px] text-slate-400">
                Score: {result.score}/100
              </span>
            </div>
          </div>
          <RiskBadge level={riskLevel} size={isOverall ? 'md' : 'sm'} />
        </div>

        {/* Primary Concern */}
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
          {result.primaryConcern}
        </p>
      </div>

      {/* Contributing Factors */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Key Drivers
        </span>
        <ul className="space-y-1">
          {result.contributingFactors.slice(0, 2).map((factor, i) => (
            <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full mt-1 shrink-0', style.dotColor)} />
              <span className="line-clamp-2">{factor}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
