import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherData } from '../../types/weather';
import { Thermometer, Droplets, Wind, Sun, CloudRain, Cloud, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface WeatherPanelProps {
  data: WeatherData;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ data }) => {
  const [showForecast, setShowForecast] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm p-4 sm:p-5 rounded-2xl bg-slate-950/65 border border-white/12 backdrop-blur-xl shadow-2xl text-white pointer-events-auto overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Thermometer className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Atmospheric Weather
            </div>
            <div className="text-[10px] text-slate-400">Open-Meteo Forecast API</div>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
          Feels {data.feelsLike}°C
        </span>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {data.temperature}
          </span>
          <span className="text-lg font-medium text-slate-400 ml-1">°C</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {data.condition}
          </span>
        </div>
      </div>

      {/* 6 Key Atmospheric Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Droplets className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Humidity</div>
            <div className="font-bold text-white text-xs">{data.humidity}%</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Wind className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Wind</div>
            <div className="font-bold text-white text-xs">{data.windSpeed} km/h {data.windDirection}</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">UV Index</div>
            <div className="font-bold text-white text-xs">{data.uvIndex} ({data.uvLevel})</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <CloudRain className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Precipitation</div>
            <div className="font-bold text-white text-xs">{data.precipitation} mm ({data.precipitationProbability}%)</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Cloud className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Cloud Cover</div>
            <div className="font-bold text-white text-xs">{data.cloudCover}%</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
          <Thermometer className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Pressure</div>
            <div className="font-bold text-white text-xs">{data.pressure} hPa</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Accordion Toggle */}
      {data.dailyForecast && data.dailyForecast.length > 0 && (
        <div>
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>7-Day Weather Forecast</span>
            </span>
            {showForecast ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <AnimatePresence>
            {showForecast && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1"
              >
                {data.dailyForecast.map((item, idx) => (
                  <div
                    key={`${item.date}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5 text-[11px]"
                  >
                    <div className="w-16 font-semibold text-white truncate">{item.day}</div>
                    <div className="flex-1 text-slate-400 truncate px-2">{item.condition}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.precipitationProbability > 0 && (
                        <span className="text-[10px] text-indigo-400 font-medium">
                          💧{item.precipitationProbability}%
                        </span>
                      )}
                      <span className="font-bold text-white">{item.tempMax}°</span>
                      <span className="text-slate-500 font-medium">{item.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

