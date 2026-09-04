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

// Built-in offline fallback database of prominent world locations
export const FALLBACK_CITIES: LocationResult[] = [
  { id: 1, name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, elevation: 40, timezone: 'Asia/Tokyo', population: 37400000 },
  { id: 2, name: 'Paris', admin1: 'Île-de-France', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, elevation: 35, timezone: 'Europe/Paris', population: 2161000 },
  { id: 3, name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, elevation: 10, timezone: 'America/New_York', population: 8336000 },
  { id: 4, name: 'London', admin1: 'England', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, elevation: 25, timezone: 'Europe/London', population: 8982000 },
  { id: 5, name: 'Sydney', admin1: 'New South Wales', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, elevation: 19, timezone: 'Australia/Sydney', population: 5312000 },
  { id: 6, name: 'Cairo', admin1: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357, elevation: 23, timezone: 'Africa/Cairo', population: 10100000 },
  { id: 7, name: 'Singapore', admin1: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, elevation: 15, timezone: 'Asia/Singapore', population: 5637000 },
  { id: 8, name: 'Shimla', admin1: 'Himachal Pradesh', country: 'India', countryCode: 'IN', latitude: 31.1048, longitude: 77.1734, elevation: 2206, timezone: 'Asia/Kolkata', population: 206000 },
  { id: 9, name: 'San Francisco', admin1: 'California', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, elevation: 16, timezone: 'America/Los_Angeles', population: 808000 },
  { id: 10, name: 'Rio de Janeiro', admin1: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', latitude: -22.9068, longitude: -43.1729, elevation: 5, timezone: 'America/Sao_Paulo', population: 6748000 },
  { id: 11, name: 'Cape Town', admin1: 'Western Cape', country: 'South Africa', countryCode: 'ZA', latitude: -33.9249, longitude: 18.4241, elevation: 25, timezone: 'Africa/Johannesburg', population: 4618000 },
  { id: 12, name: 'Reykjavik', admin1: 'Capital Region', country: 'Iceland', countryCode: 'IS', latitude: 64.1466, longitude: -21.9426, elevation: 15, timezone: 'Atlantic/Reykjavik', population: 133000 },
  { id: 13, name: 'Dubai', admin1: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, elevation: 11, timezone: 'Asia/Dubai', population: 3331000 },
  { id: 14, name: 'Seoul', admin1: 'Seoul', country: 'South Korea', countryCode: 'KR', latitude: 37.5665, longitude: 126.9780, elevation: 38, timezone: 'Asia/Seoul', population: 9776000 },
  { id: 15, name: 'Bangkok', admin1: 'Bangkok', country: 'Thailand', countryCode: 'TH', latitude: 13.7563, longitude: 100.5018, elevation: 2, timezone: 'Asia/Bangkok', population: 10539000 },
  { id: 16, name: 'Rome', admin1: 'Lazio', country: 'Italy', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, elevation: 21, timezone: 'Europe/Rome', population: 2873000 },
  { id: 17, name: 'Vancouver', admin1: 'British Columbia', country: 'Canada', countryCode: 'CA', latitude: 49.2827, longitude: -123.1207, elevation: 70, timezone: 'America/Vancouver', population: 675218 },
  { id: 18, name: 'New Delhi', admin1: 'Delhi', country: 'India', countryCode: 'IN', latitude: 28.6139, longitude: 77.2090, elevation: 216, timezone: 'Asia/Kolkata', population: 33000000 },
  { id: 19, name: 'Mumbai', admin1: 'Maharashtra', country: 'India', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, elevation: 14, timezone: 'Asia/Kolkata', population: 20961000 },
  { id: 20, name: 'Bengaluru', admin1: 'Karnataka', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, elevation: 920, timezone: 'Asia/Kolkata', population: 13193000 },
  { id: 21, name: 'Bhopal', admin1: 'Madhya Pradesh', country: 'India', countryCode: 'IN', latitude: 23.2599, longitude: 77.4126, elevation: 527, timezone: 'Asia/Kolkata', population: 1883381 },
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
 * Searches locations using the free Open-Meteo Geocoding API:
 * https://geocoding-api.open-meteo.com/v1/search
 */
export async function searchLocations(query: string, count: number = 8): Promise<LocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((r: any) => ({
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
      }
    }
  } catch (e) {
    console.warn('Geocoding network fetch failed, using fallback database', e);
  }

  // Filter fallback database
  return FALLBACK_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      (c.admin1 && c.admin1.toLowerCase().includes(trimmed.toLowerCase())) ||
      c.country.toLowerCase().includes(trimmed.toLowerCase())
  );
}

/**
 * Formats coordinates for clean visual display (e.g., "23.26° N, 77.41° E")
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lon).toFixed(2)}° ${lonDir}`;
}

