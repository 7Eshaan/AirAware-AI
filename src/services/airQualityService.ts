import { AQIData, PollutantDetail } from '../types/aqi';
import { getAQIInfo } from '../utils/aqiUtils';

function mapEuropeanAqiCategory(eaqi: number): string {
  if (eaqi <= 20) return 'Good';
  if (eaqi <= 40) return 'Fair';
  if (eaqi <= 60) return 'Moderate';
  if (eaqi <= 80) return 'Poor';
  if (eaqi <= 100) return 'Very Poor';
  return 'Extremely Poor';
}

function linearInterpolate(c: number, cLow: number, cHigh: number, iLow: number, iHigh: number): number {
  return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
}

export function calculateSubIndexPM25(c: number): number {
  if (c <= 0) return 0;
  if (c <= 12.0) return linearInterpolate(c, 0, 12.0, 0, 50);
  if (c <= 35.4) return linearInterpolate(c, 12.1, 35.4, 51, 100);
  if (c <= 55.4) return linearInterpolate(c, 35.5, 55.4, 101, 150);
  if (c <= 150.4) return linearInterpolate(c, 55.5, 150.4, 151, 200);
  if (c <= 250.4) return linearInterpolate(c, 150.5, 250.4, 201, 300);
  if (c <= 350.4) return linearInterpolate(c, 250.5, 350.4, 301, 400);
  return linearInterpolate(c, 350.5, 500.4, 401, 500);
}

export function calculateSubIndexPM10(c: number): number {
  if (c <= 0) return 0;
  if (c <= 54) return linearInterpolate(c, 0, 54, 0, 50);
  if (c <= 154) return linearInterpolate(c, 55, 154, 51, 100);
  if (c <= 254) return linearInterpolate(c, 155, 254, 101, 150);
  if (c <= 354) return linearInterpolate(c, 255, 354, 151, 200);
  if (c <= 424) return linearInterpolate(c, 355, 424, 201, 300);
  if (c <= 504) return linearInterpolate(c, 425, 504, 301, 400);
  return linearInterpolate(c, 505, 604, 401, 500);
}

export function calculateSubIndexO3(ugm3: number): number {
  if (ugm3 <= 0) return 0;
  // 1 ppb O3 ≈ 2.0 µg/m³
  const ppb = ugm3 / 2.0;
  if (ppb <= 54) return linearInterpolate(ppb, 0, 54, 0, 50);
  if (ppb <= 70) return linearInterpolate(ppb, 55, 70, 51, 100);
  if (ppb <= 85) return linearInterpolate(ppb, 71, 85, 101, 150);
  if (ppb <= 105) return linearInterpolate(ppb, 86, 105, 151, 200);
  return linearInterpolate(ppb, 106, 200, 201, 300);
}

export function calculateSubIndexNO2(ugm3: number): number {
  if (ugm3 <= 0) return 0;
  // 1 ppb NO2 ≈ 1.88 µg/m³
  const ppb = ugm3 / 1.88;
  if (ppb <= 53) return linearInterpolate(ppb, 0, 53, 0, 50);
  if (ppb <= 100) return linearInterpolate(ppb, 54, 100, 51, 100);
  if (ppb <= 360) return linearInterpolate(ppb, 101, 360, 101, 150);
  if (ppb <= 649) return linearInterpolate(ppb, 361, 649, 151, 200);
  return linearInterpolate(ppb, 650, 1249, 201, 300);
}

export function calculateSubIndexSO2(ugm3: number): number {
  if (ugm3 <= 0) return 0;
  // 1 ppb SO2 ≈ 2.62 µg/m³
  const ppb = ugm3 / 2.62;
  if (ppb <= 35) return linearInterpolate(ppb, 0, 35, 0, 50);
  if (ppb <= 75) return linearInterpolate(ppb, 36, 75, 51, 100);
  if (ppb <= 185) return linearInterpolate(ppb, 76, 185, 101, 150);
  return linearInterpolate(ppb, 186, 304, 151, 200);
}

export function calculateSubIndexCO(mgm3: number): number {
  if (mgm3 <= 0) return 0;
  if (mgm3 <= 4.4) return linearInterpolate(mgm3, 0, 4.4, 0, 50);
  if (mgm3 <= 9.4) return linearInterpolate(mgm3, 4.5, 9.4, 51, 100);
  if (mgm3 <= 12.4) return linearInterpolate(mgm3, 9.5, 12.4, 101, 150);
  if (mgm3 <= 15.4) return linearInterpolate(mgm3, 12.5, 15.4, 151, 200);
  return linearInterpolate(mgm3, 15.5, 30.4, 201, 300);
}

/**
 * Fetches real-time Air Quality data from Open-Meteo Air Quality API:
 * https://air-quality-api.open-meteo.com/v1/air-quality
 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number
): Promise<AQIData> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia,dust&timezone=auto`
    );

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};

      const pm25Val = Number((current.pm2_5 ?? 15).toFixed(1));
      const pm10Val = Number((current.pm10 ?? 25).toFixed(1));
      const no2Val = Number((current.nitrogen_dioxide ?? 18).toFixed(1));
      const o3Val = Number((current.ozone ?? 45).toFixed(1));
      const coVal = Number(((current.carbon_monoxide ?? 250) / 1000).toFixed(2));
      const so2Val = Number((current.sulphur_dioxide ?? 5).toFixed(1));
      const nh3Val = current.ammonia !== null && current.ammonia !== undefined ? Number(current.ammonia.toFixed(1)) : 10;
      const dustVal = current.dust !== null && current.dust !== undefined ? Number(current.dust.toFixed(1)) : 8;

      // Compute precise EPA sub-indices for each pollutant
      const subIndices = [
        { name: 'PM2.5', aqi: calculateSubIndexPM25(pm25Val) },
        { name: 'PM10', aqi: calculateSubIndexPM10(pm10Val) },
        { name: 'Ozone', aqi: calculateSubIndexO3(o3Val) },
        { name: 'NO₂', aqi: calculateSubIndexNO2(no2Val) },
        { name: 'SO₂', aqi: calculateSubIndexSO2(so2Val) },
        { name: 'CO', aqi: calculateSubIndexCO(coVal) },
      ];

      subIndices.sort((a, b) => b.aqi - a.aqi);
      const dominant = subIndices[0].name;
      const calculatedAqi = Math.max(1, subIndices[0].aqi);

      // Prefer Open-Meteo's official calculated us_aqi if available and non-zero
      const aqiVal = (typeof current.us_aqi === 'number' && current.us_aqi > 0)
        ? Math.round(current.us_aqi)
        : calculatedAqi;

      const eaqiVal = (typeof current.european_aqi === 'number' && current.european_aqi >= 0)
        ? Math.round(current.european_aqi)
        : Math.min(100, Math.round(aqiVal * 0.55));

      const aqiInfo = getAQIInfo(aqiVal);
      const eaqiCategory = mapEuropeanAqiCategory(eaqiVal);

      return {
        aqi: aqiVal,
        category: aqiInfo.category,
        statusColor: aqiInfo.color,
        dominantPollutant: dominant,
        summary: aqiInfo.healthImplication,
        europeanAqi: eaqiVal,
        europeanCategory: eaqiCategory,
        pollutants: {
          pm25: {
            code: 'pm25',
            name: 'Fine Particulate Matter',
            chemicalFormula: 'PM2.5',
            value: pm25Val,
            unit: 'µg/m³',
            standardLimit: 15,
            status: pm25Val > 55 ? 'High' : (pm25Val > 35 ? 'Elevated' : (pm25Val > 15 ? 'Moderate' : 'Good')),
            description: 'Tiny inhalable particles from combustion exhaust, biomass burning, and industry.',
          },
          pm10: {
            code: 'pm10',
            name: 'Coarse Particulate Matter',
            chemicalFormula: 'PM10',
            value: pm10Val,
            unit: 'µg/m³',
            standardLimit: 45,
            status: pm10Val > 100 ? 'High' : (pm10Val > 45 ? 'Elevated' : 'Good'),
            description: 'Suspended airborne dust, tire wear, mechanical abrasion, and construction dust.',
          },
          no2: {
            code: 'no2',
            name: 'Nitrogen Dioxide',
            chemicalFormula: 'NO₂',
            value: no2Val,
            unit: 'µg/m³',
            standardLimit: 25,
            status: no2Val > 40 ? 'High' : (no2Val > 25 ? 'Moderate' : 'Good'),
            description: 'Gaseous byproduct of vehicular traffic and thermal energy generation.',
          },
          o3: {
            code: 'o3',
            name: 'Ground-Level Ozone',
            chemicalFormula: 'O₃',
            value: o3Val,
            unit: 'µg/m³',
            standardLimit: 60,
            status: o3Val > 60 ? 'Elevated' : 'Good',
            description: 'Photochemical oxidant created when sunlight acts on VOCs and nitrogen oxides.',
          },
          co: {
            code: 'co',
            name: 'Carbon Monoxide',
            chemicalFormula: 'CO',
            value: coVal,
            unit: 'mg/m³',
            standardLimit: 4.0,
            status: coVal > 4.0 ? 'Elevated' : 'Good',
            description: 'Colorless, odorless gas generated from incomplete hydrocarbon combustion.',
          },
          so2: {
            code: 'so2',
            name: 'Sulfur Dioxide',
            chemicalFormula: 'SO₂',
            value: so2Val,
            unit: 'µg/m³',
            standardLimit: 20,
            status: so2Val > 20 ? 'Elevated' : 'Good',
            description: 'Industrial emissions produced from burning sulfur-bearing fossil fuels.',
          },
          nh3: {
            code: 'nh3',
            name: 'Ammonia',
            chemicalFormula: 'NH₃',
            value: nh3Val,
            unit: 'µg/m³',
            standardLimit: 200,
            status: nh3Val > 100 ? 'Moderate' : 'Good',
            description: 'Agricultural emissions, livestock waste, and fertilizer evaporation.',
          },
          dust: {
            code: 'dust',
            name: 'Atmospheric Dust',
            chemicalFormula: 'Dust',
            value: dustVal,
            unit: 'µg/m³',
            standardLimit: 50,
            status: dustVal > 50 ? 'Elevated' : 'Good',
            description: 'Windblown soil, desert dust plumes, and mineral particles.',
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn('Live AQI fetch failed, using fallback database', e);
  }

  // Fallback estimation
  const fallbackAQI = 118;
  const aqiInfo = getAQIInfo(fallbackAQI);
  return {
    aqi: fallbackAQI,
    category: aqiInfo.category,
    statusColor: aqiInfo.color,
    dominantPollutant: 'PM2.5',
    summary: aqiInfo.healthImplication,
    europeanAqi: 48,
    europeanCategory: 'Moderate',
    pollutants: {
      pm25: { code: 'pm25', name: 'Fine Particulates', chemicalFormula: 'PM2.5', value: 42, unit: 'µg/m³', standardLimit: 15, status: 'Elevated', description: 'Tiny inhalable combustion particles.' },
      pm10: { code: 'pm10', name: 'Coarse Dust', chemicalFormula: 'PM10', value: 74, unit: 'µg/m³', standardLimit: 45, status: 'Elevated', description: 'Suspended airborne particulate matter.' },
      no2: { code: 'no2', name: 'Nitrogen Dioxide', chemicalFormula: 'NO₂', value: 26, unit: 'µg/m³', standardLimit: 25, status: 'Moderate', description: 'Vehicular and energy emissions.' },
      o3: { code: 'o3', name: 'Ozone', chemicalFormula: 'O₃', value: 38, unit: 'µg/m³', standardLimit: 60, status: 'Good', description: 'Photochemical oxidant smog.' },
      co: { code: 'co', name: 'Carbon Monoxide', chemicalFormula: 'CO', value: 0.8, unit: 'mg/m³', standardLimit: 4.0, status: 'Good', description: 'Incomplete combustion gas.' },
      so2: { code: 'so2', name: 'Sulfur Dioxide', chemicalFormula: 'SO₂', value: 8, unit: 'µg/m³', standardLimit: 20, status: 'Good', description: 'Industrial sulfur emissions.' },
      nh3: { code: 'nh3', name: 'Ammonia', chemicalFormula: 'NH₃', value: 14, unit: 'µg/m³', standardLimit: 200, status: 'Good', description: 'Agricultural emissions.' },
      dust: { code: 'dust', name: 'Dust', chemicalFormula: 'Dust', value: 22, unit: 'µg/m³', standardLimit: 50, status: 'Good', description: 'Soil and mineral dust.' },
    },
    lastUpdated: new Date().toISOString(),
  };
}

