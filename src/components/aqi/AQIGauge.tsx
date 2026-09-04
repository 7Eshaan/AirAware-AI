import React from 'react';
import { getAQIInfo, getAQIPercentage, AQI_LEVELS } from '../../utils/aqiUtils';

interface AQIGaugeProps {
  aqi: number;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({ aqi }) => {
  const info = getAQIInfo(aqi);
  const percentage = getAQIPercentage(aqi);

  return (
    <div className="w-full space-y-2">
      {/* Visual Progress Bar Meter */}
      <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60 flex">
        {/* Multi-tier gradient track representing 0-500 scale */}
        <div className="w-[10%] h-full bg-emerald-500" title="Good (0-50)" />
        <div className="w-[10%] h-full bg-amber-400" title="Moderate (51-100)" />
        <div className="w-[10%] h-full bg-orange-500" title="Unhealthy for Sensitive Groups (101-150)" />
        <div className="w-[10%] h-full bg-rose-500" title="Unhealthy (151-200)" />
        <div className="w-[20%] h-full bg-purple-600" title="Very Unhealthy (201-300)" />
        <div className="w-[40%] h-full bg-rose-950" title="Hazardous (301-500)" />
      </div>

      {/* Pointer indicator */}
      <div className="relative w-full h-3">
        <div
          className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-700"
          style={{ left: `${percentage}%` }}
        >
          <div
            className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px]"
            style={{ borderBottomColor: info.color }}
          />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
            {aqi}
          </span>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 pt-1">
        <span>0 (Good)</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300</span>
        <span>500+</span>
      </div>
    </div>
  );
};
