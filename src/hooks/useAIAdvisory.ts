import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { UserHealthProfile } from '../types/profile';
import { RiskAssessmentData } from '../types/risk';
import { AIAdvisory } from '../types/advisory';
import { generateAIAdvisory } from '../services/aiService';

export function useAIAdvisory(
  location: string,
  weather: WeatherData,
  aqi: AQIData,
  userProfile: UserHealthProfile,
  riskAssessment: RiskAssessmentData
) {
  const [advisory, setAdvisory] = useState<AIAdvisory | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  const refreshAdvisory = useCallback(async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAIAdvisory(
        location,
        weather,
        aqi,
        userProfile,
        riskAssessment
      );
      setAdvisory(generated);
    } catch (e) {
      console.error('Error generating AI Advisory', e);
    } finally {
      setIsGenerating(false);
    }
  }, [location, weather, aqi, userProfile, riskAssessment]);

  // Initial load and regeneration when core inputs change
  useEffect(() => {
    refreshAdvisory();
  }, [refreshAdvisory]);

  return {
    advisory,
    isGenerating,
    refreshAdvisory,
  };
}
