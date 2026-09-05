import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Loader2, X, Sparkles, Shuffle } from 'lucide-react';
import { LocationResult, searchLocations, formatCoordinates, FALLBACK_CITIES } from '../../services/geocodingService';

interface LocationSearchProps {
  onSelectLocation: (location: LocationResult) => void;
  selectedLocationName?: string | null;
  onRandomLocation?: () => void;
  isFlying?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  selectedLocationName,
  onRandomLocation,
  isFlying = false,
}) => {
  const [query, setQuery] = useState(selectedLocationName || '');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevSelected, setPrevSelected] = useState(selectedLocationName);
  if (selectedLocationName !== prevSelected) {
    setPrevSelected(selectedLocationName);
    setQuery(selectedLocationName || '');
  }

  const popularLocations: LocationResult[] = FALLBACK_CITIES.slice(0, 8);

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

  // Immediate search execution (triggered by Enter key or Search button)
  const executeSearch = async (overrideQuery?: string) => {
    const target = (overrideQuery ?? query).trim();
    if (!target) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // 1. If results already exist in the dropdown, select the first match
    if (results.length > 0) {
      handleSelect(results[0]);
      return;
    }

    // 2. Otherwise trigger immediate live search
    setIsLoading(true);
    try {
      const hits = await searchLocations(target);
      if (hits.length > 0) {
        handleSelect(hits[0]);
      } else {
        // 3. Fallback search against built-in cities database
        const match = FALLBACK_CITIES.find(
          (c) =>
            c.name.toLowerCase().includes(target.toLowerCase()) ||
            c.country.toLowerCase().includes(target.toLowerCase()) ||
            (c.admin1 && c.admin1.toLowerCase().includes(target.toLowerCase()))
        );
        if (match) {
          handleSelect(match);
        } else {
          // Open dropdown so user sees featured locations
          setIsOpen(true);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full"
    >
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-emerald-400">
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
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          disabled={isFlying}
          placeholder="Search city or country..."
          className="w-full pl-9 sm:pl-11 pr-20 sm:pr-36 py-2 sm:py-3 text-xs sm:text-sm bg-slate-950/80 hover:bg-slate-900/90 focus:bg-slate-900 text-white placeholder-slate-400 rounded-2xl border border-white/15 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/20 backdrop-blur-xl shadow-2xl transition-all duration-200 outline-none"
        />

        <div className="absolute inset-y-0 right-0 pr-1.5 sm:pr-2.5 flex items-center gap-1 sm:gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="p-1 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Dedicated Search Action Button */}
          <button
            type="submit"
            disabled={isFlying || !query.trim()}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-500/25 shrink-0"
            title="Search this location (Enter)"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 stroke-[2.5]" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>

          {onRandomLocation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onRandomLocation();
              }}
              disabled={isFlying}
              className="p-1.5 text-emerald-400 hover:text-emerald-300 cursor-pointer rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all group/btn disabled:opacity-50 shrink-0"
              title="Explore random location"
            >
              <Shuffle className="h-3.5 w-3.5 group-hover/btn:rotate-45 transition-transform" />
            </button>
          )}
        </div>
      </form>

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
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2 hidden sm:inline">
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
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Featured Locations</span>
                </div>
                {onRandomLocation && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onRandomLocation();
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Shuffle className="h-3 w-3" />
                    <span>Random City</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {popularLocations.map((p) => (
                  <button
                    key={`${p.id}-${p.name}`}
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
    </motion.div>
  );
};

