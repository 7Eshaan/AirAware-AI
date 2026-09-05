import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SevenDayTrendsData } from '../../types/trends';
import { AQITrendChart } from '../trends/AQITrendChart';
import { TempTrendChart } from '../trends/TempTrendChart';
import { RiskTrendChart } from '../trends/RiskTrendChart';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Wind,
  Thermometer,
  Activity,
  History,
  ArrowRight,
  FileText,
  Trash2,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { fetchUserAdvisoryHistory, deleteAdvisoryHistoryRecord, AdvisoryHistoryRecord } from '../../services/historyService';

interface HistoryPanelProps {
  data: SevenDayTrendsData;
  defaultExpanded?: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ data, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [viewMode, setViewMode] = useState<'trends' | 'advisories'>('trends');
  const [timeframe, setTimeframe] = useState<'history' | 'forecast'>('history');
  const [activeTab, setActiveTab] = useState<'aqi' | 'temp' | 'risk'>('aqi');

  const [advisoryHistory, setAdvisoryHistory] = useState<AdvisoryHistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const records = await fetchUserAdvisoryHistory(25);
      setAdvisoryHistory(records);
    } catch (err) {
      console.warn('Failed to load advisory history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleSelectAdvisories = () => {
    setViewMode('advisories');
    loadHistory();
  };

  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && viewMode === 'advisories') {
      loadHistory();
    }
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteAdvisoryHistoryRecord(id);
    setAdvisoryHistory((prev) => prev.filter((r) => r.id !== id));
  };

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
        onClick={handleToggleExpand}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="hidden sm:inline">Environmental Telemetry & History</span>
              <span className="sm:hidden">Telemetry & History</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({isExpanded ? 'Collapse' : 'Expand'})
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Open-Meteo Telemetry & AI Advisory Archive for {data.locationName}
            </div>
          </div>
        </div>

        <button className="p-1 rounded-lg text-slate-400 hover:text-white">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expandable Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/10 p-4 space-y-3"
          >
            {/* Main Mode Toggle: Telemetry Trends vs Saved Advisories */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/5">
              <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('trends')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'trends'
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Telemetry Trends</span>
                  <span className="sm:hidden">Trends</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAdvisories}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'advisories'
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span className="hidden sm:inline">Advisory Archive</span>
                  <span className="sm:hidden">Archive</span>
                  {advisoryHistory.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      {advisoryHistory.length}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                {viewMode === 'trends' ? '7-Day Telemetry' : 'PostgreSQL Archive'}
              </span>
            </div>

            {/* 1. Telemetry Trends View */}
            {viewMode === 'trends' && (
              <div className="space-y-3">
                {/* Timeframe Selector */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                    <button
                      onClick={() => setTimeframe('history')}
                      className={`px-2 sm:px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        timeframe === 'history'
                          ? 'bg-blue-600 text-white font-bold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <History className="h-3 w-3" />
                      <span className="hidden sm:inline">Past 7 Days (Observed)</span>
                      <span className="sm:hidden">Past 7d</span>
                    </button>
                    <button
                      onClick={() => setTimeframe('forecast')}
                      className={`px-2 sm:px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        timeframe === 'forecast'
                          ? 'bg-emerald-600 text-white font-bold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowRight className="h-3 w-3" />
                      <span className="hidden sm:inline">Next 7 Days (Forecast)</span>
                      <span className="sm:hidden">Next 7d</span>
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
              </div>
            )}

            {/* 2. Saved Advisories Archive View */}
            {viewMode === 'advisories' && (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {isLoadingHistory ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Loading historical advisories from database...
                  </div>
                ) : advisoryHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">No Advisory History Recorded Yet</p>
                    <p className="text-[11px]">
                      Search destinations or switch profile parameters to generate and archive personalized health advisories.
                    </p>
                  </div>
                ) : (
                  advisoryHistory.map((rec) => {
                    const d = new Date(rec.created_at);
                    const formattedDate = `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
                    const riskColor =
                      rec.overall_risk === 'Very High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      rec.overall_risk === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      rec.overall_risk === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                    return (
                      <div
                        key={rec.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 hover:border-white/20 transition-all"
                      >
                        {/* Header: Location & Timestamp */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{rec.location_name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formattedDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${riskColor}`}>
                              {rec.overall_risk || 'Moderate'} Risk
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteRecord(rec.id, e)}
                              className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Telemetry quick metrics */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-300">
                          <span>Temp: <strong className="text-white">{rec.temperature}°C</strong></span>
                          <span>AQI: <strong className="text-white">{rec.aqi}</strong></span>
                          {rec.pm25 !== undefined && <span>PM2.5: <strong className="text-white">{rec.pm25} µg/m³</strong></span>}
                          {rec.advisory?.maskRecommendation && (
                            <span className="text-[10px] text-amber-300 font-medium">
                              Mask: {rec.advisory.maskRecommendation}
                            </span>
                          )}
                        </div>

                        {/* Advisory Content */}
                        {rec.advisory?.headline && (
                          <div className="text-xs font-semibold text-emerald-300">
                            {rec.advisory.headline}
                          </div>
                        )}
                        {rec.advisory?.summary && (
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {rec.advisory.summary}
                          </p>
                        )}

                        {/* Top Action */}
                        {rec.advisory?.recommendedActions?.[0] && (
                          <div className="pt-1 flex items-start gap-1.5 text-[11px] text-slate-400">
                            <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{rec.advisory.recommendedActions[0]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
