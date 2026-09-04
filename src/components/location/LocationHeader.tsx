import React from 'react';
import { MapPin, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { Badge } from '../common/Badge';
import { CityData, MOCK_CITIES } from '../../data/mockCities';
import { formatRelativeTime } from '../../utils/formatters';

interface LocationHeaderProps {
  locationName: string;
  cityName: string;
  lastUpdated: string;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectCity: (city: CityData) => void;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
  locationName,
  cityName,
  lastUpdated,
  isLoading,
  onRefresh,
  onSelectCity,
}) => {
  return (
    <div className="w-full pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Location & Status */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Badge variant="primary" size="sm" dot>
              Current Location
            </Badge>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {formatRelativeTime(lastUpdated)}</span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh environmental data"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
              <span>Sync</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {locationName}
            </h1>
          </div>
        </div>

        {/* Right: Search & Quick City Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <LocationSearch
            currentCityName={cityName}
            onSelectCity={onSelectCity}
          />
        </div>
      </div>

      {/* Quick City Filter Chips */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Quick Switch:
        </span>
        {MOCK_CITIES.map((city) => {
          const isSelected = city.name === cityName;
          return (
            <button
              key={city.id}
              onClick={() => onSelectCity(city)}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {city.name} ({city.aqi.aqi} AQI)
            </button>
          );
        })}
      </div>
    </div>
  );
};
