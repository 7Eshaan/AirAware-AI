import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SevenDayTrendsData } from '../../types/trends';
import { AQITrendChart } from '../trends/AQITrendChart';
import { TempTrendChart } from '../trends/TempTrendChart';
import { RiskTrendChart } from '../trends/RiskTrendChart';
import { BarChart3, ChevronDown, ChevronUp, Wind, Thermometer, Activity, History, ArrowRight } from 'lucide-react';

interface HistoryPanelProps {
  data: SevenDayTrendsData;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeframe, setTimeframe] = useState<'history' | 'forecast'>('history');
  const [activeTab, setActiveTab] = useState<'aqi' | 'temp' | 'risk'>('aqi');

  const historyPoints = data.historyPoints && data.historyPoints.length > 0 ? data.historyPoints : data.points;
  const forecastPoints = data.forecastPoints && data.forecastPoints.length > 0 ? data.forecastPoints : data.points;

  const currentPoints = timeframe === 'history' ? historyPoints : forecastPoints;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl rounded-2xl bg-slate-950/70 border border-white/12 backdrop-blur-xl shadow-2xl text-white pointer-events-auto overflow-hidden"
    >
      {/* Clickable Header that toggles expansion */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Environmental Telemetry & Trends</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({isExpanded ? 'Click to collapse' : 'Click to expand'})
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Open-Meteo Historical & Forecast Telemetry for {data.locationName}
            </div>
          </div>
        </div>

        <button className="p-1 rounded-lg text-slate-400 hover:text-white">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expandable Chart Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/10 p-4 space-y-3"
          >
            {/* Top row: Timeframe Selector (Past 7 Days History vs Next 7 Days Forecast) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                <button
                  onClick={() => setTimeframe('history')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    timeframe === 'history'
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="h-3 w-3" />
                  <span>Past 7 Days (Observed)</span>
                </button>
                <button
                  onClick={() => setTimeframe('forecast')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    timeframe === 'forecast'
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>Next 7 Days (Forecast)</span>
                </button>
              </div>

              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                {timeframe === 'history' ? 'Observed Weather & AQI' : 'Projected Weather & AQI'}
              </span>
            </div>

            {/* Metric tab switchers */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('aqi')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'aqi' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wind className="h-3 w-3 text-orange-400" />
                <span>AQI Trend</span>
              </button>

              <button
                onClick={() => setActiveTab('temp')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'temp' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Thermometer className="h-3 w-3 text-amber-400" />
                <span>Temperature</span>
              </button>

              <button
                onClick={() => setActiveTab('risk')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'risk' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="h-3 w-3 text-rose-400" />
                <span>Personal Risk</span>
              </button>
            </div>

            {/* Chart Container */}
            <div className="pt-2">
              {activeTab === 'aqi' && <AQITrendChart data={currentPoints} />}
              {activeTab === 'temp' && <TempTrendChart data={currentPoints} />}
              {activeTab === 'risk' && <RiskTrendChart data={currentPoints} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

