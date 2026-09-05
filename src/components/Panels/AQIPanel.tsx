import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AQIData } from '../../types/aqi';
import { getAQIInfo } from '../../utils/aqiUtils';
import { Wind, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface AQIPanelProps {
  data: AQIData;
}

export const AQIPanel: React.FC<AQIPanelProps> = ({ data }) => {
  const [standard, setStandard] = useState<'us' | 'eu'>('us');
  const [showExtended, setShowExtended] = useState(false);

  const aqiInfo = getAQIInfo(data.aqi);

  // European AQI category color mapping
  const getEuColor = (eaqi: number) => {
    if (eaqi <= 20) return '#10B981'; // Green
    if (eaqi <= 40) return '#84CC16'; // Light Green
    if (eaqi <= 60) return '#F59E0B'; // Amber
    if (eaqi <= 80) return '#EF4444'; // Red
    if (eaqi <= 100) return '#8B5CF6'; // Purple
    return '#881337'; // Maroon
  };

  const activeAqi = standard === 'us' ? data.aqi : (data.europeanAqi ?? Math.round(data.aqi / 2));
  const activeCategory = standard === 'us' ? data.category : (data.europeanCategory || 'Moderate');
  const activeColor = standard === 'us' ? aqiInfo.color : getEuColor(data.europeanAqi ?? 40);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: 0, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:max-w-[330px] shrink-0 p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-xl shadow-2xl text-white pointer-events-auto overflow-hidden"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400">
            <Wind className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Air Quality Index
            </div>
            <div className="text-[9px] text-slate-400">Open-Meteo Air Quality API</div>
          </div>
        </div>

        {/* Standard Switcher (US EPA vs European EAQI) */}
        <div className="flex items-center p-0.5 rounded-lg bg-white/10 border border-white/10 text-[9px] font-semibold">
          <button
            onClick={() => setStandard('us')}
            className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
              standard === 'us' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            US EPA
          </button>
          <button
            onClick={() => setStandard('eu')}
            className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
              standard === 'eu' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            EU (EAQI)
          </button>
        </div>
      </div>

      {/* Numerical AQI & Category */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: activeColor }}
          >
            {activeAqi}
          </span>
          <span className="text-[11px] text-slate-400 ml-1.5">
            {standard === 'us' ? 'US AQI' : 'EAQI'}
          </span>
        </div>

        <div className="text-right">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
            style={{
              backgroundColor: `${activeColor}25`,
              color: activeColor,
              border: `1px solid ${activeColor}60`,
            }}
          >
            {activeCategory}
          </span>
          <div className="text-[9px] text-slate-400 mt-0.5">
            Primary: <span className="font-semibold text-slate-300">{data.dominantPollutant}</span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800 flex mb-2">
        <div className="w-[10%] bg-emerald-500" />
        <div className="w-[10%] bg-amber-400" />
        <div className="w-[10%] bg-orange-500" />
        <div className="w-[10%] bg-rose-500" />
        <div className="w-[20%] bg-purple-600" />
        <div className="w-[40%] bg-rose-950" />
      </div>

      {/* Criteria Pollutants Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-xs mb-2">
        <div className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span className="font-bold text-white">PM2.5</span>
            <span className="text-[9px]">{data.pollutants.pm25.status}</span>
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {data.pollutants.pm25.value} <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
          </div>
        </div>

        <div className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span className="font-bold text-white">PM10</span>
            <span className="text-[9px]">{data.pollutants.pm10.status}</span>
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {data.pollutants.pm10.value} <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
          </div>
        </div>

        <div className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span className="font-bold text-white">NO₂</span>
            <span className="text-[9px]">{data.pollutants.no2.status}</span>
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {data.pollutants.no2.value} <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
          </div>
        </div>

        <div className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span className="font-bold text-white">O₃</span>
            <span className="text-[9px]">{data.pollutants.o3.status}</span>
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {data.pollutants.o3.value} <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
          </div>
        </div>
      </div>

      {/* Expandable Extended Pollutants Section */}
      <div>
        <button
          onClick={() => setShowExtended(!showExtended)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-orange-400" />
            <span>More Pollutants (CO, SO₂, NH₃, Dust)</span>
          </span>
          {showExtended ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        <AnimatePresence>
          {showExtended && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 grid grid-cols-2 gap-2 text-xs"
            >
              {data.pollutants.co && (
                <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-white">CO (Carbon Monoxide)</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.pollutants.co.value} <span className="text-[10px] font-normal text-slate-400">mg/m³</span>
                  </div>
                </div>
              )}

              {data.pollutants.so2 && (
                <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-white">SO₂ (Sulfur Dioxide)</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.pollutants.so2.value} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                  </div>
                </div>
              )}

              {data.pollutants.nh3 && (
                <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-white">NH₃ (Ammonia)</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.pollutants.nh3.value} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                  </div>
                </div>
              )}

              {data.pollutants.dust && (
                <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-white">Aerosol Dust</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.pollutants.dust.value} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

