import React from 'react';
import { PollutantDetail } from '../../types/aqi';
import { Card } from '../common/Card';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PollutantGridProps {
  pollutants: {
    pm25: PollutantDetail;
    pm10: PollutantDetail;
    no2: PollutantDetail;
    o3: PollutantDetail;
    co?: PollutantDetail;
    so2?: PollutantDetail;
  };
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  const items = [
    pollutants.pm25,
    pollutants.pm10,
    pollutants.no2,
    pollutants.o3,
  ];

  const statusBadgeStyles = {
    Good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Elevated: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    High: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Hazardous: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {items.map((p) => {
        const isSafe = p.value <= p.standardLimit;
        const ratio = (p.value / p.standardLimit).toFixed(1);

        return (
          <div
            key={p.code}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    {p.chemicalFormula}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {p.name.split(' ')[0]}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                    statusBadgeStyles[p.status]
                  )}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {p.value}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {p.unit}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                WHO Limit: <strong>{p.standardLimit}</strong>
              </span>
              <span
                className={cn(
                  'font-medium',
                  isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {isSafe ? 'Within safe limit' : `${ratio}x safe limit`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
