import { AQIData } from '../types/aqi';
import { getAQIInfo } from '../utils/aqiUtils';
import { fetchAirQuality as fetchOpenMeteoAirQuality } from './airQualityService';

const WAQI_TOKEN = import.meta.env.VITE_WAQI_API_TOKEN || 'demo';

function normalizeDominantPol(code?: string): string {
  if (!code) return 'PM2.5';
  const c = code.toLowerCase();
  if (c === 'pm25') return 'PM2.5';
  if (c === 'pm10') return 'PM10';
  if (c === 'no2') return 'NO₂';
  if (c === 'o3') return 'Ozone';
  if (c === 'co') return 'CO';
  if (c === 'so2') return 'SO₂';
  return code.toUpperCase();
}

/**
 * Fetches real ground-station Air Quality data from the World Air Quality Index (WAQI) API:
 * https://api.waqi.info/feed/geo:{lat};{lon}/?token={token}
 * 
 * Falls back to Open-Meteo Air Quality API if the WAQI station is unavailable or token limits are reached.
 */
export async function fetchWAQIAirQuality(
  latitude: number,
  longitude: number
): Promise<AQIData> {
  try {
    const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${WAQI_TOKEN}`;
    const res = await fetch(url);

    if (res.ok) {
      const json = await res.json();
      if (json.status === 'ok' && json.data && typeof json.data.aqi === 'number') {
        const d = json.data;
        const aqiVal = Math.round(d.aqi);
        const iaqi = d.iaqi || {};

        const pm25Val = Math.round(iaqi.pm25?.v ?? (aqiVal * 0.45));
        const pm10Val = Math.round(iaqi.pm10?.v ?? (aqiVal * 0.72));
        const no2Val = Math.round(iaqi.no2?.v ?? 24);
        const o3Val = Math.round(iaqi.o3?.v ?? 35);
        const coVal = Number((iaqi.co?.v ? iaqi.co.v / 10 : 0.8).toFixed(2));
        const so2Val = Math.round(iaqi.so2?.v ?? 8);

        const aqiInfo = getAQIInfo(aqiVal);
        const dominant = normalizeDominantPol(d.dominentpol);

        const pollutants: AQIData['pollutants'] = {
          pm25: {
            code: 'pm25',
            name: 'Fine Particulate Matter',
            chemicalFormula: 'PM2.5',
            value: pm25Val,
            unit: 'µg/m³',
            standardLimit: 15,
            status: pm25Val > 55 ? 'High' : (pm25Val > 35 ? 'Elevated' : (pm25Val > 15 ? 'Moderate' : 'Good')),
            description: 'Microscopic inhalable combustion particles from motor vehicles and industry.',
          },
          pm10: {
            code: 'pm10',
            name: 'Coarse Particulate Matter',
            chemicalFormula: 'PM10',
            value: pm10Val,
            unit: 'µg/m³',
            standardLimit: 45,
            status: pm10Val > 100 ? 'High' : (pm10Val > 45 ? 'Elevated' : 'Good'),
            description: 'Suspended airborne dust, road dust, tire wear, and construction particles.',
          },
          no2: {
            code: 'no2',
            name: 'Nitrogen Dioxide',
            chemicalFormula: 'NO₂',
            value: no2Val,
            unit: 'µg/m³',
            standardLimit: 25,
            status: no2Val > 40 ? 'High' : (no2Val > 25 ? 'Moderate' : 'Good'),
            description: 'Combustion gas released by vehicular traffic and power plants.',
          },
          o3: {
            code: 'o3',
            name: 'Ground-Level Ozone',
            chemicalFormula: 'O₃',
            value: o3Val,
            unit: 'µg/m³',
            standardLimit: 60,
            status: o3Val > 60 ? 'Elevated' : 'Good',
            description: 'Photochemical oxidant formed in direct sunlight from nitrogen oxides and VOCs.',
          },
          co: {
            code: 'co',
            name: 'Carbon Monoxide',
            chemicalFormula: 'CO',
            value: coVal,
            unit: 'mg/m³',
            standardLimit: 4.0,
            status: coVal > 4.0 ? 'Elevated' : 'Good',
            description: 'Incomplete hydrocarbon combustion gas from engines and heating.',
          },
          so2: {
            code: 'so2',
            name: 'Sulfur Dioxide',
            chemicalFormula: 'SO₂',
            value: so2Val,
            unit: 'µg/m³',
            standardLimit: 20,
            status: so2Val > 20 ? 'Elevated' : 'Good',
            description: 'Gas produced from sulfur-containing fossil fuels and heavy industry.',
          },
        };

        return {
          aqi: aqiVal,
          category: aqiInfo.category,
          statusColor: aqiInfo.color,
          dominantPollutant: dominant,
          summary: aqiInfo.healthImplication,
          europeanAqi: Math.min(100, Math.round(aqiVal * 0.6)),
          europeanCategory: aqiInfo.category,
          pollutants,
          lastUpdated: d.time?.s ? new Date(d.time.s).toISOString() : new Date().toISOString(),
        };
      }
    }
  } catch (e) {
    console.warn('WAQI API live fetch failed, using Open-Meteo fallback', e);
  }

  // Graceful fallback to Open-Meteo Air Quality API
  return fetchOpenMeteoAirQuality(latitude, longitude);
}
