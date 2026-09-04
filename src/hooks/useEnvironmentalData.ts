import { useState, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { RiskAssessmentData } from '../types/risk';
import { AIAdvisory } from '../types/advisory';
import { SevenDayTrendsData } from '../types/trends';
import { UserHealthProfile } from '../types/profile';

import { fetchWeather } from '../services/weatherService';
import { fetchAirQuality } from '../services/airQualityService';
import { fetchHistoricalData } from '../services/historicalService';
import { calculateRiskAssessment } from '../services/riskEngine';
import { generateAIAdvisory } from '../services/aiService';

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
        // Parallel data fetch as specified in prompt Phase 19
        const [weatherData, aqiData, historicalData] = await Promise.all([
          fetchWeather(latitude, longitude),
          fetchAirQuality(latitude, longitude),
          fetchHistoricalData(latitude, longitude, locationName, profile),
        ]);

        // Deterministic Risk Assessment
        const calculatedRisk = calculateRiskAssessment(weatherData, aqiData, profile);

        // AI Advisory Generation
        const generatedAdvisory = await generateAIAdvisory(
          locationName,
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
      const updatedAdvisory = await generateAIAdvisory(
        locationName,
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
