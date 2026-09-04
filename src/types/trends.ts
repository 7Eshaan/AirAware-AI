import { RiskLevel } from './risk';

export interface DailyTrendPoint {
  day: string;            // e.g. "Mon", "Tue", "Sep 1"
  date: string;           // e.g. "2026-09-04" or "Sep 04"
  aqi: number;
  pm25: number;
  pm10: number;
  tempMax: number;        // Celsius
  tempMin: number;        // Celsius
  humidity: number;       // %
  uvMax: number;
  precipitation?: number; // mm
  condition?: string;
  weatherCode?: number;
  personalRiskLevel: RiskLevel;
  personalRiskScore: number; // 0-100
}

export interface SevenDayTrendsData {
  locationName: string;
  points: DailyTrendPoint[];              // Default / active trend points
  historyPoints?: DailyTrendPoint[];      // Real past 7-day observed telemetry
  forecastPoints?: DailyTrendPoint[];     // Real future 7-day projected telemetry
  isRealData?: boolean;
}

