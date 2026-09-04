import { useMemo } from 'react';
import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { UserHealthProfile } from '../types/profile';
import { RiskAssessmentData } from '../types/risk';
import { calculateRiskAssessment } from '../services/riskEngine';

export function useRiskAssessment(
  weather: WeatherData,
  aqi: AQIData,
  userProfile: UserHealthProfile
): RiskAssessmentData {
  return useMemo(() => {
    return calculateRiskAssessment(weather, aqi, userProfile);
  }, [weather, aqi, userProfile]);
}
