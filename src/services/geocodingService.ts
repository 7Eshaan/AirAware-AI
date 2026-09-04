export interface LocationResult {
  id: string | number;
  name: string;
  admin1?: string; // State / Province
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  population?: number;
}

// Common regional and historical aliases
const COMMON_ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  peking: 'Beijing',
  usa: 'United States',
  us: 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  uae: 'United Arab Emirates',
  nyc: 'New York',
  ny: 'New York',
  la: 'Los Angeles',
  sf: 'San Francisco',
  dc: 'Washington',
};

// Rich offline fallback database of prominent world & Indian locations
export const FALLBACK_CITIES: LocationResult[] = [
  // India Metropolitan & Strategic Hubs
  { id: 18, name: 'New Delhi', admin1: 'National Capital Territory of Delhi', country: 'India', countryCode: 'IN', latitude: 28.6139, longitude: 77.2090, elevation: 216, timezone: 'Asia/Kolkata', population: 33000000 },
  { id: 19, name: 'Mumbai', admin1: 'Maharashtra', country: 'India', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, elevation: 14, timezone: 'Asia/Kolkata', population: 20961000 },
  { id: 20, name: 'Bengaluru', admin1: 'Karnataka', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, elevation: 920, timezone: 'Asia/Kolkata', population: 13193000 },
  { id: 21, name: 'Bhopal', admin1: 'Madhya Pradesh', country: 'India', countryCode: 'IN', latitude: 23.2599, longitude: 77.4126, elevation: 527, timezone: 'Asia/Kolkata', population: 1883381 },
  { id: 22, name: 'Kolkata', admin1: 'West Bengal', country: 'India', countryCode: 'IN', latitude: 22.5726, longitude: 88.3639, elevation: 9, timezone: 'Asia/Kolkata', population: 14850000 },
  { id: 23, name: 'Chennai', admin1: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 13.0827, longitude: 80.2707, elevation: 6, timezone: 'Asia/Kolkata', population: 11503000 },
  { id: 24, name: 'Hyderabad', admin1: 'Telangana', country: 'India', countryCode: 'IN', latitude: 17.3850, longitude: 78.4867, elevation: 542, timezone: 'Asia/Kolkata', population: 10499000 },
  { id: 25, name: 'Ahmedabad', admin1: 'Gujarat', country: 'India', countryCode: 'IN', latitude: 23.0225, longitude: 72.5714, elevation: 53, timezone: 'Asia/Kolkata', population: 8450000 },
  { id: 26, name: 'Pune', admin1: 'Maharashtra', country: 'India', countryCode: 'IN', latitude: 18.5204, longitude: 73.8567, elevation: 560, timezone: 'Asia/Kolkata', population: 6830000 },
  { id: 27, name: 'Jaipur', admin1: 'Rajasthan', country: 'India', countryCode: 'IN', latitude: 26.9124, longitude: 75.7873, elevation: 431, timezone: 'Asia/Kolkata', population: 3915000 },
  { id: 28, name: 'Lucknow', admin1: 'Uttar Pradesh', country: 'India', countryCode: 'IN', latitude: 26.8467, longitude: 80.9462, elevation: 123, timezone: 'Asia/Kolkata', population: 3765000 },
  { id: 29, name: 'Chandigarh', admin1: 'Chandigarh', country: 'India', countryCode: 'IN', latitude: 30.7333, longitude: 76.7794, elevation: 321, timezone: 'Asia/Kolkata', population: 1158000 },
  { id: 8, name: 'Shimla', admin1: 'Himachal Pradesh', country: 'India', countryCode: 'IN', latitude: 31.1048, longitude: 77.1734, elevation: 2206, timezone: 'Asia/Kolkata', population: 206000 },
  { id: 30, name: 'Indore', admin1: 'Madhya Pradesh', country: 'India', countryCode: 'IN', latitude: 22.7196, longitude: 75.8577, elevation: 553, timezone: 'Asia/Kolkata', population: 3100000 },

  // Global Metropolises
  { id: 1, name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, elevation: 40, timezone: 'Asia/Tokyo', population: 37400000 },
  { id: 2, name: 'Paris', admin1: 'Île-de-France', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, elevation: 35, timezone: 'Europe/Paris', population: 2161000 },
  { id: 3, name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, elevation: 10, timezone: 'America/New_York', population: 8336000 },
  { id: 4, name: 'London', admin1: 'England', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, elevation: 25, timezone: 'Europe/London', population: 8982000 },
  { id: 5, name: 'Sydney', admin1: 'New South Wales', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, elevation: 19, timezone: 'Australia/Sydney', population: 5312000 },
  { id: 6, name: 'Cairo', admin1: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357, elevation: 23, timezone: 'Africa/Cairo', population: 10100000 },
  { id: 7, name: 'Singapore', admin1: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, elevation: 15, timezone: 'Asia/Singapore', population: 5637000 },
  { id: 9, name: 'San Francisco', admin1: 'California', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, elevation: 16, timezone: 'America/Los_Angeles', population: 808000 },
  { id: 10, name: 'Rio de Janeiro', admin1: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', latitude: -22.9068, longitude: -43.1729, elevation: 5, timezone: 'America/Sao_Paulo', population: 6748000 },
  { id: 11, name: 'Cape Town', admin1: 'Western Cape', country: 'South Africa', countryCode: 'ZA', latitude: -33.9249, longitude: 18.4241, elevation: 25, timezone: 'Africa/Johannesburg', population: 4618000 },
  { id: 12, name: 'Reykjavik', admin1: 'Capital Region', country: 'Iceland', countryCode: 'IS', latitude: 64.1466, longitude: -21.9426, elevation: 15, timezone: 'Atlantic/Reykjavik', population: 133000 },
  { id: 13, name: 'Dubai', admin1: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, elevation: 11, timezone: 'Asia/Dubai', population: 3331000 },
  { id: 14, name: 'Seoul', admin1: 'Seoul', country: 'South Korea', countryCode: 'KR', latitude: 37.5665, longitude: 126.9780, elevation: 38, timezone: 'Asia/Seoul', population: 9776000 },
  { id: 15, name: 'Bangkok', admin1: 'Bangkok', country: 'Thailand', countryCode: 'TH', latitude: 13.7563, longitude: 100.5018, elevation: 2, timezone: 'Asia/Bangkok', population: 10539000 },
  { id: 16, name: 'Rome', admin1: 'Lazio', country: 'Italy', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, elevation: 21, timezone: 'Europe/Rome', population: 2873000 },
  { id: 17, name: 'Vancouver', admin1: 'British Columbia', country: 'Canada', countryCode: 'CA', latitude: 49.2827, longitude: -123.1207, elevation: 70, timezone: 'America/Vancouver', population: 675218 },
  { id: 31, name: 'Berlin', admin1: 'Berlin', country: 'Germany', countryCode: 'DE', latitude: 52.5200, longitude: 13.4050, elevation: 34, timezone: 'Europe/Berlin', population: 3677472 },
  { id: 32, name: 'Toronto', admin1: 'Ontario', country: 'Canada', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, elevation: 76, timezone: 'America/Toronto', population: 2930000 },
  { id: 33, name: 'Amsterdam', admin1: 'North Holland', country: 'Netherlands', countryCode: 'NL', latitude: 52.3676, longitude: 4.9041, elevation: 2, timezone: 'Europe/Amsterdam', population: 872680 },
];

/**
 * Returns a random location from the curated featured cities list.
 * Optionally excludes a specific city to guarantee a new destination when shuffling.
 */
export function getRandomLocation(excludeName?: string): LocationResult {
  const pool = excludeName
    ? FALLBACK_CITIES.filter((c) => c.name.toLowerCase() !== excludeName.toLowerCase())
    : FALLBACK_CITIES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || FALLBACK_CITIES[0];
}

/**
 * High-accuracy multi-tiered location search:
 * 1. Resolves common aliases (e.g. Bangalore -> Bengaluru, USA -> United States).
 * 2. Queries Open-Meteo Geocoding API with population-weighted ranking.
 * 3. Falls back to Photon (OpenStreetMap) for comprehensive global coverage.
 * 4. Falls back to curated city database offline.
 */
export async function searchLocations(query: string, count: number = 8): Promise<LocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // 1. Resolve alias if whole query matches
  const lowerQuery = trimmed.toLowerCase();
  const resolvedQuery = COMMON_ALIASES[lowerQuery] || trimmed;

  // Handle queries with commas like "Delhi, India" or "London, UK"
  let primaryName = resolvedQuery;
  let secondaryFilter = '';
  if (resolvedQuery.includes(',')) {
    const parts = resolvedQuery.split(',').map((p) => p.trim());
    primaryName = parts[0];
    secondaryFilter = parts.slice(1).join(' ').toLowerCase();
  }

  // Check alias on primary name as well (e.g., "Bangalore, India")
  if (COMMON_ALIASES[primaryName.toLowerCase()]) {
    primaryName = COMMON_ALIASES[primaryName.toLowerCase()];
  }

  // 2. Primary source: Open-Meteo Geocoding API
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(primaryName)}&count=20&language=en&format=json`
    );

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        let list: LocationResult[] = data.results.map((r: any) => ({
          id: r.id,
          name: r.name,
          admin1: r.admin1,
          country: r.country,
          countryCode: r.country_code,
          latitude: Number(r.latitude.toFixed(4)),
          longitude: Number(r.longitude.toFixed(4)),
          elevation: r.elevation ? Math.round(r.elevation) : undefined,
          timezone: r.timezone,
          population: r.population,
        }));

        // If user typed secondary filter (e.g., "India" in "Delhi, India")
        if (secondaryFilter) {
          const matched = list.filter(
            (item) =>
              (item.country && item.country.toLowerCase().includes(secondaryFilter)) ||
              (item.countryCode && item.countryCode.toLowerCase() === secondaryFilter) ||
              (item.admin1 && item.admin1.toLowerCase().includes(secondaryFilter))
          );
          if (matched.length > 0) {
            list = matched;
          }
        }

        // Sort by exact name match first, then by population descending
        list.sort((a, b) => {
          const aExact = a.name.toLowerCase() === primaryName.toLowerCase() ? 1 : 0;
          const bExact = b.name.toLowerCase() === primaryName.toLowerCase() ? 1 : 0;
          if (aExact !== bExact) return bExact - aExact;
          return (b.population ?? 0) - (a.population ?? 0);
        });

        // Deduplicate close coordinates
        const seen = new Set<string>();
        const uniqueList: LocationResult[] = [];
        for (const loc of list) {
          const key = `${loc.name.toLowerCase()}-${loc.country.toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueList.push(loc);
          }
          if (uniqueList.length >= count) break;
        }

        if (uniqueList.length > 0) {
          return uniqueList;
        }
      }
    }
  } catch (e) {
    console.warn('Open-Meteo Geocoding failed, trying secondary geocoder', e);
  }

  // 3. Secondary source: Photon (OpenStreetMap) API
  try {
    const pRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=${count}`
    );
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData.features && pData.features.length > 0) {
        return pData.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          return {
            id: props.osm_id || `photon-${idx}`,
            name: props.name || trimmed,
            admin1: props.state || props.county,
            country: props.country || '',
            countryCode: props.countrycode?.toUpperCase(),
            latitude: Number(coords[1].toFixed(4)),
            longitude: Number(coords[0].toFixed(4)),
          };
        });
      }
    }
  } catch (pErr) {
    console.warn('Photon geocoding failed, using fallback database', pErr);
  }

  // 4. Offline Fallback: Filter curated database
  return FALLBACK_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      (c.admin1 && c.admin1.toLowerCase().includes(lowerQuery)) ||
      c.country.toLowerCase().includes(lowerQuery)
  ).slice(0, count);
}

/**
 * Formats coordinates for clean visual display (e.g., "23.26° N, 77.41° E")
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lon).toFixed(2)}° ${lonDir}`;
}

