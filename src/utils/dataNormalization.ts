import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';

export interface EnvironmentalSnapshot {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  weather: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    precipitation: number;
    condition: string;
    pressure?: number;
  };
  airQuality: {
    aqi: number;
    category: string;
    dominantPollutant: string;
    pm25: number;
    pm10: number;
    no2?: number;
    o3?: number;
    co?: number;
    so2?: number;
  };
  timestamp: string;
}

/**
 * Normalizes live weather, air quality, and geographic coordinates into
 * a canonical snapshot format for the risk engine and AI advisory prompt.
 */
export function normalizeEnvironmentalData(
  locationName: string,
  latitude: number,
  longitude: number,
  weather: WeatherData,
  aqi: AQIData
): EnvironmentalSnapshot {
  return {
    location: {
      name: locationName,
      latitude: Number(latitude.toFixed(4)),
      longitude: Number(longitude.toFixed(4)),
    },
    weather: {
      temperature: weather.temperature,
      apparentTemperature: weather.feelsLike,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      uvIndex: weather.uvIndex,
      precipitation: weather.precipitation ?? 0,
      condition: weather.condition,
      pressure: weather.pressure,
    },
    airQuality: {
      aqi: aqi.aqi,
      category: aqi.category,
      dominantPollutant: aqi.dominantPollutant,
      pm25: aqi.pollutants.pm25.value,
      pm10: aqi.pollutants.pm10.value,
      no2: aqi.pollutants.no2?.value,
      o3: aqi.pollutants.o3?.value,
      co: aqi.pollutants.co?.value,
      so2: aqi.pollutants.so2?.value,
    },
    timestamp: new Date().toISOString(),
  };
}
