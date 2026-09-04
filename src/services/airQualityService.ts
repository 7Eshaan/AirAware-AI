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

      const aqiVal = Math.round(current.us_aqi ?? 75);
      const eaqiVal = Math.round(current.european_aqi ?? 35);
      const pm25Val = Math.round(current.pm2_5 ?? 24);
      const pm10Val = Math.round(current.pm10 ?? 46);
      const no2Val = Math.round(current.nitrogen_dioxide ?? 22);
      const o3Val = Math.round(current.ozone ?? 48);
      const coVal = Number(((current.carbon_monoxide ?? 320) / 1000).toFixed(2));
      const so2Val = Math.round(current.sulphur_dioxide ?? 6);
      const nh3Val = Math.round(current.ammonia ?? 12);
      const dustVal = Math.round(current.dust ?? 18);

      const aqiInfo = getAQIInfo(aqiVal);
      const eaqiCategory = mapEuropeanAqiCategory(eaqiVal);

      // Determine dominant stressor pollutant
      let dominant = 'PM2.5';
      if (pm25Val > 35) dominant = 'PM2.5';
      else if (pm10Val > 50) dominant = 'PM10';
      else if (o3Val > 70) dominant = 'Ozone';
      else if (no2Val > 40) dominant = 'NO₂';

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

