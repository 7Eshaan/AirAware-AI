import React from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../../types/weather';
import { Thermometer, Droplets, Wind, Sun, CloudRain, Cloud } from 'lucide-react';

interface WeatherPanelProps {
  data: WeatherData;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ data }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:max-w-[340px] shrink-0 p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-xl shadow-2xl text-white pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Thermometer className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Atmospheric Weather
            </div>
            <div className="text-[9px] text-slate-400">Open-Meteo Forecast API</div>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5">
          Feels {data.feelsLike}°C
        </span>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-baseline justify-between mb-2.5">
        <div>
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {data.temperature}
          </span>
          <span className="text-sm font-medium text-slate-400 ml-1">°C</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm">
            {data.condition}
          </span>
        </div>
      </div>

      {/* 6 Key Atmospheric Metrics Grid */}
      <div className="grid grid-cols-3 gap-1.5 text-xs mb-2.5">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 min-h-[44px]">
          <Droplets className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider leading-none">Humidity</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{data.humidity}%</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 min-h-[44px]">
          <Wind className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider leading-none">Wind</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{data.windSpeed} km/h</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 min-h-[44px]">
          <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider leading-none">UV Index</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{data.uvIndex} ({data.uvLevel})</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 min-h-[44px]">
          <CloudRain className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider leading-none">Precip</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{data.precipitation} mm</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 min-h-[44px]">
          <Cloud className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider leading-none">Clouds</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{data.cloudCover}%</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 min-h-[44px]">
          <Thermometer className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider leading-none">Pressure</div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{data.pressure} hPa</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

