import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X, Sparkles } from 'lucide-react';
import { LocationResult, searchLocations, formatCoordinates } from '../../services/geocodingService';

interface LocationSearchProps {
  onSelectLocation: (location: LocationResult) => void;
  isFlying?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  isFlying = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const popularLocations: LocationResult[] = [
    { id: 'bhopal', name: 'Bhopal', admin1: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, elevation: 527 },
    { id: 'delhi', name: 'New Delhi', admin1: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, elevation: 216 },
    { id: 'london', name: 'London', admin1: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, elevation: 25 },
    { id: 'tokyo', name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, elevation: 40 },
    { id: 'nyc', name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, elevation: 10 },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      const hits = await searchLocations(val);
      setResults(hits);
      setIsLoading(false);
      setIsOpen(true);
    }, 280);
  };

  const handleSelect = (loc: LocationResult) => {
    onSelectLocation(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-30 w-[90vw] max-w-lg"
    >
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <Search className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={isFlying}
          placeholder="Search a location..."
          className="w-full pl-11 pr-10 py-3 text-sm bg-slate-950/70 hover:bg-slate-900/80 focus:bg-slate-900/90 text-white placeholder-slate-400 rounded-2xl border border-white/15 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/20 backdrop-blur-xl shadow-2xl transition-all duration-200 outline-none"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="mt-2 w-full bg-slate-950/85 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 divide-y divide-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
              {results.map((loc) => (
                <button
                  key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer text-slate-200 hover:text-white group"
                >
                  <MapPin className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm truncate text-white">
                        {loc.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                        {formatCoordinates(loc.latitude, loc.longitude)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-0.5">
                      <span>{[loc.admin1, loc.country].filter(Boolean).join(', ')}</span>
                      {loc.elevation !== undefined && (
                        <span className="text-[10px] text-slate-500">• {loc.elevation}m elev.</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Featured Locations</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {popularLocations.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
