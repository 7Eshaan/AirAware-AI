export interface DailyForecastItem {
  date: string;                     // e.g. "2026-09-06"
  day: string;                      // e.g. "Sun", "Tomorrow"
  tempMax: number;                  // in Celsius
  tempMin: number;                  // in Celsius
  apparentTempMax?: number;         // in Celsius
  apparentTempMin?: number;         // in Celsius
  precipitationProbability: number; // 0-100%
  precipitationSum: number;         // in mm
  uvMax: number;                    // UV index max
  condition: string;                // e.g. "Scattered Showers"
  weatherCode: number;
}

export interface HourlyForecastItem {
  time: string;                     // e.g. "14:00"
  temperature: number;              // in Celsius
  humidity: number;                 // in %
  precipitationProbability: number; // in %
  uvIndex: number;
  condition: string;
}

export interface WeatherData {
  temperature: number;              // in Celsius
  feelsLike: number;                // in Celsius
  humidity: number;                 // percentage (0-100)
  windSpeed: number;                // in km/h
  windDirection: string;            // e.g. "NW", "ESE"
  uvIndex: number;                  // 0-11+
  uvLevel: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  condition: string;                // e.g. "Partly Cloudy", "Sunny", "Hazy"
  conditionCode: string;
  pressure: number;                 // in hPa
  visibility: number;               // in km
  precipitation?: number;           // in mm
  precipitationProbability?: number;// in %
  cloudCover?: number;              // in %
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
  dailyForecast?: DailyForecastItem[];
  hourly?: HourlyForecastItem[];
  latitude?: number;
  longitude?: number;
}

