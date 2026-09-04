import React from 'react';
import { AQIData } from '../../types/aqi';
import { Card } from '../common/Card';
import { AQIGauge } from './AQIGauge';
import { PollutantGrid } from './PollutantGrid';
import { getAQIInfo } from '../../utils/aqiUtils';
import { AlertCircle, Wind, Info, ShieldAlert } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';
import { Badge } from '../common/Badge';

interface AQIOverviewProps {
  aqiData: AQIData;
  isLoading?: boolean;
}

export const AQIOverview: React.FC<AQIOverviewProps> = ({
  aqiData,
  isLoading = false,
}) => {
  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const aqiInfo = getAQIInfo(aqiData.aqi);

  return (
    <Card variant="elevated" className="space-y-6">
      {/* Top Header: Title & Dominant Pollutant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Air Quality Index (AQI)
            </h2>
            <Badge variant="outline" size="sm">
              EPA Standard
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous ambient particulate & gaseous monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Primary Stressor:</span>
          <span className="font-semibold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {aqiData.dominantPollutant}
          </span>
        </div>
      </div>

      {/* Prominent AQI Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${aqiInfo.borderColor} ${aqiInfo.bgColor} transition-all`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Large Numerical Display */}
          <div className="flex items-center gap-5">
            <div className="text-center sm:text-left">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                Current AQI
              </div>
              <div
                className="text-5xl sm:text-6xl font-black tracking-tight"
                style={{ color: aqiInfo.color }}
              >
                {aqiData.aqi}
              </div>
            </div>

            <div className="h-14 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            {/* Category Status & Health Implication */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full ${aqiInfo.badgeBg} ${aqiInfo.badgeText}`}
                >
                  {aqiData.category}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-xl">
                {aqiInfo.healthImplication}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {aqiInfo.cautionaryStatement}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Gauge Meter */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <AQIGauge aqi={aqiData.aqi} />
        </div>
      </div>

      {/* Pollutant Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Wind className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Key Atmospheric Pollutants
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time concentration breakdown
          </span>
        </div>

        <PollutantGrid pollutants={aqiData.pollutants} />
      </div>
    </Card>
  );
};
