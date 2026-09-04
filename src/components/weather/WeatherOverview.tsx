import React from 'react';
import { WeatherData } from '../../types/weather';
import { WeatherMetricCard } from './WeatherMetricCard';
import { Thermometer, Droplets, Wind, SunMedium } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

interface WeatherOverviewProps {
  weather: WeatherData;
  isLoading?: boolean;
}

export const WeatherOverview: React.FC<WeatherOverviewProps> = ({
  weather,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const uvBadgeStyles = {
    Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    'Very High': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    Extreme: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Current Environmental Overview
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Condition: <strong className="text-slate-700 dark:text-slate-300">{weather.condition}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Temperature */}
        <WeatherMetricCard
          title="Temperature"
          value={weather.temperature}
          unit="°C"
          icon={<Thermometer className="h-5 w-5" />}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          description={`Feels like ${weather.feelsLike}°C • ${weather.condition}`}
          trend={weather.trend}
          trendText={weather.trend === 'rising' ? '+1.2°C vs 3h ago' : 'Stable'}
        />

        {/* 2. Humidity */}
        <WeatherMetricCard
          title="Humidity"
          value={weather.humidity}
          unit="%"
          icon={<Droplets className="h-5 w-5" />}
          iconBgColor="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          description={weather.humidity > 65 ? 'Elevated indoor/outdoor mugginess' : 'Comfortable relative humidity'}
          trend="stable"
          trendText="Dew point 21°C"
        />

        {/* 3. Wind Speed */}
        <WeatherMetricCard
          title="Wind Speed"
          value={weather.windSpeed}
          unit="km/h"
          icon={<Wind className="h-5 w-5" />}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          description={`Direction ${weather.windDirection} • Gentle dispersion`}
          trend="stable"
          trendText="Gusts up to 18 km/h"
        />

        {/* 4. UV Index */}
        <WeatherMetricCard
          title="UV Index"
          value={weather.uvIndex}
          icon={<SunMedium className="h-5 w-5" />}
          iconBgColor="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          badgeLabel={weather.uvLevel}
          badgeColorClass={uvBadgeStyles[weather.uvLevel]}
          description={weather.uvIndex >= 6 ? 'Sun protection recommended during midday' : 'Low risk of solar radiation harm'}
          trend={weather.uvIndex >= 6 ? 'rising' : 'stable'}
          trendText="Peak 11:30 AM - 2:00 PM"
        />
      </div>
    </div>
  );
};
