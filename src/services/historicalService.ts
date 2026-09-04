import { SevenDayTrendsData, DailyTrendPoint } from '../types/trends';
import { RiskLevel } from '../types/risk';
import { UserHealthProfile } from '../types/profile';
import { mapWeatherCodeToCondition } from './weatherService';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function calculateDailyRiskScore(
  aqi: number,
  tempMax: number,
  uvMax: number,
  profile?: UserHealthProfile
): { score: number; level: RiskLevel } {
  let multiplier = 1.0;
  if (profile) {
    if (profile.healthConditions?.includes('Asthma') || profile.healthConditions?.includes('Respiratory Condition')) multiplier += 0.25;
    if (profile.healthConditions?.includes('Heart Condition')) multiplier += 0.2;
    if (profile.ageGroup === 'Child' || profile.ageGroup === 'Senior Citizen') multiplier += 0.15;
    if (profile.occupation === 'Outdoor Worker' || profile.occupation === 'Construction Worker' || profile.occupation === 'Delivery Worker') multiplier += 0.2;
  }

  // Base components: Pollution (50%), Heat (30%), UV (20%)
  const pollutionPart = Math.min(50, (aqi / 300) * 50);
  const heatPart = tempMax > 28 ? Math.min(30, ((tempMax - 28) / 14) * 30) : 5;
  const uvPart = Math.min(20, (uvMax / 11) * 20);

  const rawScore = Math.round((pollutionPart + heatPart + uvPart) * multiplier);
  const score = Math.max(0, Math.min(100, rawScore));

  let level: RiskLevel = 'Low';
  if (score >= 80) level = 'Very High';
  else if (score >= 60) level = 'High';
  else if (score >= 35) level = 'Moderate';

  return { score, level };
}

/**
 * Fetches real 7-day historical telemetry and 7-day forecast telemetry from Open-Meteo:
 * - Weather Forecast API with past_days=7 and forecast_days=7
 * - Air Quality API with past_days=7 and forecast_days=7
 */
export async function fetchHistoricalData(
  latitude: number,
  longitude: number,
  locationName: string = 'Selected Location',
  profile?: UserHealthProfile
): Promise<SevenDayTrendsData> {
  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max&hourly=relative_humidity_2m&past_days=7&forecast_days=7&timezone=auto`
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi,pm2_5,pm10&past_days=7&forecast_days=7&timezone=auto`
      ),
    ]);

    if (weatherRes.ok && aqiRes.ok) {
      const weatherData = await weatherRes.json();
      const aqiData = await aqiRes.json();

      const wDaily = weatherData.daily || {};
      const wHourly = weatherData.hourly || {};
      const aHourly = aqiData.hourly || {};

      const allPoints: DailyTrendPoint[] = [];

      for (let i = 0; i < (wDaily.time?.length || 0); i++) {
        const dateStr = wDaily.time[i]; // e.g. "2026-09-02"
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = WEEKDAYS[d.getDay()];
        const displayDate = `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;

        const tempMax = Math.round(wDaily.temperature_2m_max?.[i] ?? 30);
        const tempMin = Math.round(wDaily.temperature_2m_min?.[i] ?? 22);
        const precip = Number((wDaily.precipitation_sum?.[i] ?? 0).toFixed(1));
        const uvMax = Math.round(wDaily.uv_index_max?.[i] ?? 6);
        const code = wDaily.weather_code?.[i] ?? 1;

        // Extract daily average AQI, PM2.5, PM10 from hourly timestamps
        let dayAqi = 75;
        let dayPm25 = 24;
        let dayPm10 = 48;
        let dayHumidity = 55;

        if (aHourly.time && Array.isArray(aHourly.time)) {
          const hourIndices: number[] = [];
          for (let h = 0; h < aHourly.time.length; h++) {
            if (aHourly.time[h].startsWith(dateStr)) hourIndices.push(h);
          }

          if (hourIndices.length > 0) {
            const aqis = hourIndices.map((idx) => aHourly.us_aqi?.[idx]).filter((v): v is number => typeof v === 'number');
            const pm25s = hourIndices.map((idx) => aHourly.pm2_5?.[idx]).filter((v): v is number => typeof v === 'number');
            const pm10s = hourIndices.map((idx) => aHourly.pm10?.[idx]).filter((v): v is number => typeof v === 'number');

            if (aqis.length > 0) dayAqi = Math.round(aqis.reduce((sum, v) => sum + v, 0) / aqis.length);
            if (pm25s.length > 0) dayPm25 = Math.round(pm25s.reduce((sum, v) => sum + v, 0) / pm25s.length);
            if (pm10s.length > 0) dayPm10 = Math.round(pm10s.reduce((sum, v) => sum + v, 0) / pm10s.length);
          }
        }

        // Estimate daily average humidity from wHourly
        if (wHourly.time && Array.isArray(wHourly.time)) {
          const hIndices: number[] = [];
          for (let h = 0; h < wHourly.time.length; h++) {
            if (wHourly.time[h].startsWith(dateStr)) hIndices.push(h);
          }
          if (hIndices.length > 0) {
            const hums = hIndices.map((idx) => wHourly.relative_humidity_2m?.[idx]).filter((v): v is number => typeof v === 'number');
            if (hums.length > 0) dayHumidity = Math.round(hums.reduce((sum, v) => sum + v, 0) / hums.length);
          }
        }

        const risk = calculateDailyRiskScore(dayAqi, tempMax, uvMax, profile);

        allPoints.push({
          day: dayOfWeek,
          date: displayDate,
          aqi: dayAqi,
          pm25: dayPm25,
          pm10: dayPm10,
          tempMax,
          tempMin,
          humidity: dayHumidity,
          uvMax,
          precipitation: precip,
          condition: mapWeatherCodeToCondition(code),
          weatherCode: code,
          personalRiskLevel: risk.level,
          personalRiskScore: risk.score,
        });
      }

      // First 7 are observed past days; following are forecast days
      const historyPoints = allPoints.slice(0, 7);
      const forecastPoints = allPoints.slice(7, 14);

      return {
        locationName,
        points: historyPoints.length > 0 ? historyPoints : allPoints.slice(0, 7),
        historyPoints,
        forecastPoints,
        isRealData: true,
      };
    }
  } catch (e) {
    console.warn('Real Open-Meteo historical fetch failed, generating reliable estimate', e);
  }

  // Graceful fallback
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const now = new Date();
  const fallbackPoints: DailyTrendPoint[] = days.map((day, index) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - index));
    const dateStr = `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;

    const aqi = Math.max(35, Math.min(220, Math.round(95 + Math.sin(index * 1.3) * 25)));
    const pm25 = Math.round(aqi * 0.42);
    const pm10 = Math.round(aqi * 0.75);
    const tempMax = Math.round(30 + Math.cos(index * 0.9) * 3);
    const tempMin = Math.round(21 + Math.sin(index * 0.9) * 2);
    const humidity = Math.round(58 + Math.sin(index * 1.5) * 8);
    const uvMax = Math.round(6 + (index % 2));
    const risk = calculateDailyRiskScore(aqi, tempMax, uvMax, profile);

    return {
      day,
      date: dateStr,
      aqi,
      pm25,
      pm10,
      tempMax,
      tempMin,
      humidity,
      uvMax,
      precipitation: index === 3 ? 1.2 : 0,
      condition: index === 3 ? 'Slight Rain' : 'Partly Cloudy',
      personalRiskLevel: risk.level,
      personalRiskScore: risk.score,
    };
  });

  return {
    locationName,
    points: fallbackPoints,
    historyPoints: fallbackPoints,
    forecastPoints: fallbackPoints,
    isRealData: false,
  };
}

/**
 * Direct interface for the Open-Meteo Historical Weather Archive API:
 * https://archive-api.open-meteo.com/v1/archive
 * Allows querying weather observations spanning back to 1940.
 */
export async function fetchArchiveWeatherData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Archive API request failed with status ${res.status}`);
  return res.json();
}

