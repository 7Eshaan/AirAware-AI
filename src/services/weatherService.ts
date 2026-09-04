import { WeatherData, DailyForecastItem, HourlyForecastItem } from '../types/weather';

export function mapWeatherCodeToCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog & Haze';
  if (code === 51 || code === 53 || code === 55) return 'Light Drizzle';
  if (code === 56 || code === 57) return 'Freezing Drizzle';
  if (code === 61) return 'Slight Rain';
  if (code === 63) return 'Moderate Rain';
  if (code === 65) return 'Heavy Rain';
  if (code === 66 || code === 67) return 'Freezing Rain';
  if (code >= 71 && code <= 77) return 'Snow Fall';
  if (code === 80 || code === 81) return 'Rain Showers';
  if (code === 82) return 'Violent Showers';
  if (code === 85 || code === 86) return 'Snow Showers';
  if (code === 95) return 'Thunderstorm';
  if (code >= 96) return 'Thunderstorm with Hail';
  return 'Partly Cloudy';
}

export function mapUvToLevel(uv: number): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

export function getWindDirectionStr(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index] || 'NW';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Fetches real meteorological telemetry from Open-Meteo Weather Forecast API:
 * https://api.open-meteo.com/v1/forecast
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  fallback?: WeatherData
): Promise<WeatherData> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=auto`
    );

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const temp = Math.round(current.temperature_2m ?? 30);
      const feelsLike = Math.round(current.apparent_temperature ?? temp + 2);
      const humidity = Math.round(current.relative_humidity_2m ?? 55);
      const windSpeed = Math.round(current.wind_speed_10m ?? 12);
      const windDir = getWindDirectionStr(current.wind_direction_10m ?? 315);
      const uvMax = Math.round(daily.uv_index_max?.[0] ?? 6);
      const weatherCode = current.weather_code ?? 1;
      const condition = mapWeatherCodeToCondition(weatherCode);
      const precipitation = Number((current.precipitation ?? 0).toFixed(1));
      const cloudCover = Math.round(current.cloud_cover ?? 20);

      // Parse 7-day daily forecast
      const dailyForecast: DailyForecastItem[] = [];
      if (daily.time && Array.isArray(daily.time)) {
        for (let i = 0; i < daily.time.length && i < 7; i++) {
          const dateStr = daily.time[i];
          const d = new Date(dateStr + 'T00:00:00');
          const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : WEEKDAYS[d.getDay()]);
          const code = daily.weather_code?.[i] ?? 1;

          dailyForecast.push({
            date: dateStr,
            day: dayName,
            tempMax: Math.round(daily.temperature_2m_max?.[i] ?? temp + 2),
            tempMin: Math.round(daily.temperature_2m_min?.[i] ?? temp - 5),
            apparentTempMax: daily.apparent_temperature_max ? Math.round(daily.apparent_temperature_max[i]) : undefined,
            apparentTempMin: daily.apparent_temperature_min ? Math.round(daily.apparent_temperature_min[i]) : undefined,
            precipitationProbability: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
            precipitationSum: Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
            uvMax: Math.round(daily.uv_index_max?.[i] ?? 5),
            condition: mapWeatherCodeToCondition(code),
            weatherCode: code,
          });
        }
      }

      // Parse next 24 hours of hourly data
      const hourlyForecast: HourlyForecastItem[] = [];
      if (hourly.time && Array.isArray(hourly.time)) {
        const nowHour = new Date().getHours();
        for (let i = nowHour; i < nowHour + 24 && i < hourly.time.length; i++) {
          const timeRaw = hourly.time[i];
          const hourLabel = timeRaw ? timeRaw.split('T')[1]?.slice(0, 5) || `${i % 24}:00` : `${i % 24}:00`;
          const code = hourly.weather_code?.[i] ?? 1;

          hourlyForecast.push({
            time: hourLabel,
            temperature: Math.round(hourly.temperature_2m?.[i] ?? temp),
            humidity: Math.round(hourly.relative_humidity_2m?.[i] ?? humidity),
            precipitationProbability: Math.round(hourly.precipitation_probability?.[i] ?? 0),
            uvIndex: Math.round(hourly.uv_index?.[i] ?? 0),
            condition: mapWeatherCodeToCondition(code),
          });
        }
      }

      // Estimate current precipitation probability from first daily or hourly value
      const precipProb = dailyForecast[0]?.precipitationProbability ?? (hourlyForecast[0]?.precipitationProbability || 0);

      return {
        temperature: temp,
        feelsLike,
        humidity,
        windSpeed,
        windDirection: windDir,
        uvIndex: uvMax,
        uvLevel: mapUvToLevel(uvMax),
        condition,
        conditionCode: `code-${weatherCode}`,
        pressure: Math.round(current.surface_pressure ?? 1012),
        visibility: hourly.visibility?.[0] ? Number((hourly.visibility[0] / 1000).toFixed(1)) : 8.5,
        precipitation,
        precipitationProbability: precipProb,
        cloudCover,
        trend: temp > 30 ? 'rising' : 'stable',
        lastUpdated: new Date().toISOString(),
        dailyForecast,
        hourly: hourlyForecast,
        latitude,
        longitude,
      };
    }
  } catch (e) {
    console.warn('Live Weather fetch failed, using fallback', e);
  }

  // Fallback
  if (fallback) {
    return {
      ...fallback,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    temperature: 32,
    feelsLike: 35,
    humidity: 58,
    windSpeed: 12,
    windDirection: 'NW',
    uvIndex: 6,
    uvLevel: 'Moderate',
    condition: 'Hazy Sun',
    conditionCode: 'partly-cloudy',
    pressure: 1012,
    visibility: 4.5,
    precipitation: 0.0,
    precipitationProbability: 15,
    cloudCover: 25,
    trend: 'rising',
    lastUpdated: new Date().toISOString(),
    dailyForecast: [
      { date: 'Today', day: 'Today', tempMax: 33, tempMin: 23, precipitationProbability: 10, precipitationSum: 0, uvMax: 7, condition: 'Hazy Sun', weatherCode: 1 },
      { date: 'Tomorrow', day: 'Tomorrow', tempMax: 34, tempMin: 24, precipitationProbability: 20, precipitationSum: 0, uvMax: 7, condition: 'Partly Cloudy', weatherCode: 2 },
      { date: 'Day 3', day: 'Wed', tempMax: 32, tempMin: 22, precipitationProbability: 40, precipitationSum: 2.1, uvMax: 6, condition: 'Scattered Showers', weatherCode: 80 },
      { date: 'Day 4', day: 'Thu', tempMax: 30, tempMin: 21, precipitationProbability: 60, precipitationSum: 5.4, uvMax: 5, condition: 'Rain Showers', weatherCode: 61 },
      { date: 'Day 5', day: 'Fri', tempMax: 31, tempMin: 22, precipitationProbability: 15, precipitationSum: 0, uvMax: 6, condition: 'Partly Cloudy', weatherCode: 2 },
      { date: 'Day 6', day: 'Sat', tempMax: 33, tempMin: 23, precipitationProbability: 10, precipitationSum: 0, uvMax: 7, condition: 'Clear Sky', weatherCode: 0 },
      { date: 'Day 7', day: 'Sun', tempMax: 34, tempMin: 24, precipitationProbability: 10, precipitationSum: 0, uvMax: 7, condition: 'Clear Sky', weatherCode: 0 },
    ],
  };
}

// Alias for backwards compatibility
export const fetchWeatherData = fetchWeather;

