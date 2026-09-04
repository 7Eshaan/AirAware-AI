import React from 'react';
import { PersonalizedAlert } from '../../types/alert';
import { RiskBadge } from '../risk/RiskBadge';
import { Card } from '../common/Card';
import { Clock, AlertTriangle, Flame, Wind, Sun, Activity } from 'lucide-react';
import { formatRelativeTime, formatTimestamp } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface AlertCardProps {
  alert: PersonalizedAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getCategoryIcon = () => {
    switch (alert.category) {
      case 'Pollution':
        return <Wind className="h-4 w-4 text-orange-500" />;
      case 'Heat':
        return <Flame className="h-4 w-4 text-amber-500" />;
      case 'UV':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'Compound':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              {getCategoryIcon()}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {alert.title}
            </span>
          </div>
          <RiskBadge level={alert.riskLevel} size="sm" />
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {alert.message}
        </p>

        {alert.actionPrompt && (
          <div className="mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
            Action: {alert.actionPrompt}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Category: {alert.category}
        </span>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatTimestamp(alert.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
