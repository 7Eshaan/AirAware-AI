import { useState, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { RiskAssessmentData } from '../types/risk';
import { AIAdvisory } from '../types/advisory';
import { SevenDayTrendsData } from '../types/trends';
import { UserHealthProfile } from '../types/profile';

import { fetchWeather } from '../services/weatherService';
import { fetchWAQIAirQuality } from '../services/waqiService';
import { fetchHistoricalData } from '../services/historicalService';
import { calculateRiskAssessment } from '../services/riskEngine';
import { generateHealthAdvisory } from '../services/advisoryService';

export function useEnvironmentalData() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [trends, setTrends] = useState<SevenDayTrendsData | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentData | null>(null);
  const [advisory, setAdvisory] = useState<AIAdvisory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEnvironmentForLocation = useCallback(
    async (
      latitude: number,
      longitude: number,
      locationName: string,
      profile: UserHealthProfile
    ) => {
      setIsLoading(true);

      try {
        // Parallel telemetry ingestion: Open-Meteo Weather + WAQI AQI + Historical trends
        const [weatherData, aqiData, historicalData] = await Promise.all([
          fetchWeather(latitude, longitude),
          fetchWAQIAirQuality(latitude, longitude),
          fetchHistoricalData(latitude, longitude, locationName, profile),
        ]);

        // Deterministic Risk Assessment
        const calculatedRisk = calculateRiskAssessment(weatherData, aqiData, profile);

        // Secure AI Health Advisory via Supabase Edge Function / Gemini
        const generatedAdvisory = await generateHealthAdvisory(
          locationName,
          latitude,
          longitude,
          weatherData,
          aqiData,
          profile,
          calculatedRisk
        );

        setWeather(weatherData);
        setAqi(aqiData);
        setTrends(historicalData);
        setRiskAssessment(calculatedRisk);
        setAdvisory(generatedAdvisory);
      } catch (e) {
        console.error('Error fetching environmental telemetry', e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Recalculate risk & advisory when profile changes without refetching weather/aqi
  const recalculateForProfile = useCallback(
    async (locationName: string, profile: UserHealthProfile) => {
      if (!weather || !aqi) return;

      const updatedRisk = calculateRiskAssessment(weather, aqi, profile);
      const updatedAdvisory = await generateHealthAdvisory(
        locationName,
        weather.latitude ?? 0,
        weather.longitude ?? 0,
        weather,
        aqi,
        profile,
        updatedRisk
      );

      setRiskAssessment(updatedRisk);
      setAdvisory(updatedAdvisory);
    },
    [weather, aqi]
  );

  return {
    weather,
    aqi,
    trends,
    riskAssessment,
    advisory,
    isLoading,
    fetchEnvironmentForLocation,
    recalculateForProfile,
  };
}
