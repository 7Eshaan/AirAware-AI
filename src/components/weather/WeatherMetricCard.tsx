import React from 'react';
import { Card } from '../common/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface WeatherMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  description: string;
  trend?: 'rising' | 'falling' | 'stable';
  trendText?: string;
  badgeLabel?: string;
  badgeColorClass?: string;
}

export const WeatherMetricCard: React.FC<WeatherMetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  iconBgColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  description,
  trend,
  trendText,
  badgeLabel,
  badgeColorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}) => {
  return (
    <Card variant="elevated" className="flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-xl', iconBgColor)}>
          {icon}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-lg font-medium text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
          {badgeLabel && (
            <span className={cn('ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold', badgeColorClass)}>
              {badgeLabel}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {(trend || trendText) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 dark:text-slate-500">Trend</span>
          <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
            {trend === 'rising' && <TrendingUp className="h-3.5 w-3.5 text-rose-500" />}
            {trend === 'falling' && <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />}
            {trend === 'stable' && <Minus className="h-3.5 w-3.5 text-slate-400" />}
            <span>{trendText || (trend ? trend.charAt(0).toUpperCase() + trend.slice(1) : '')}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
