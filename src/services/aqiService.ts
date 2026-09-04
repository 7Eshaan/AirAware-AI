import { AQIData } from '../types/aqi';
import { DEFAULT_AQI } from '../data/sampleData';

/**
 * Phase 2 Service: Air Quality Data Provider
 * 
 * Future Integration:
 * Connects to Open-Meteo Air Quality API:
 * https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone
 * 
 * Returns standard AQIData structure:
 * - aqi
 * - pm25
 * - pm10
 * - no2
 * - o3
 */
export async function fetchAQIData(
  lat: number,
  lon: number,
  fallback?: AQIData
): Promise<AQIData> {
  // Simulates asynchronous fetch contract
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (fallback) {
    return {
      ...fallback,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    ...DEFAULT_AQI,
    lastUpdated: new Date().toISOString(),
  };
}
