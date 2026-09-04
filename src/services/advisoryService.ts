import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { UserHealthProfile } from '../types/profile';
import { RiskAssessmentData } from '../types/risk';
import { AIAdvisory } from '../types/advisory';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateAIAdvisory as generateLocalAdvisory } from './aiService';
import { recordAdvisoryHistory } from './historyService';

/**
 * High-level service for generating personalized AI environmental health advisories.
 * 
 * 1. Invokes the secure Supabase Edge Function ('generate-health-advisory') where GEMINI_API_KEY
 *    is securely stored server-side.
 * 2. If Supabase Edge Function is unreachable or running offline, automatically uses the
 *    deterministic clinical intelligence fallback so the app NEVER hangs or crashes.
 * 3. Records the generated advisory into user history (Supabase PostgreSQL + local cache).
 */
export async function generateHealthAdvisory(
  locationName: string,
  latitude: number,
  longitude: number,
  weather: WeatherData,
  aqi: AQIData,
  userProfile: UserHealthProfile,
  riskAssessment: RiskAssessmentData
): Promise<AIAdvisory> {
  let advisory: AIAdvisory | null = null;

  // 1. Try Supabase Edge Function if Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-health-advisory', {
        body: {
          location: locationName,
          weather,
          aqi,
          userProfile,
          riskAssessment,
        },
      });

      if (!error && data && data.headline && data.summary) {
        advisory = data as AIAdvisory;
      } else if (error) {
        console.warn('Supabase Edge Function invocation error, falling back to local engine:', error.message);
      }
    } catch (edgeErr) {
      console.warn('Edge Function network call failed, falling back to local engine:', edgeErr);
    }
  }

  // 2. Resilient fallback: use the comprehensive clinical rules engine in aiService
  if (!advisory) {
    advisory = await generateLocalAdvisory(
      locationName,
      weather,
      aqi,
      userProfile,
      riskAssessment
    );
  }

  // 3. Automatically record to advisory history
  try {
    await recordAdvisoryHistory({
      location_name: locationName,
      latitude,
      longitude,
      temperature: weather.temperature,
      apparent_temperature: weather.feelsLike,
      humidity: weather.humidity,
      wind_speed: weather.windSpeed,
      uv_index: weather.uvIndex,
      precipitation: weather.precipitation,
      aqi: aqi.aqi,
      pm25: aqi.pollutants?.pm25?.value,
      pm10: aqi.pollutants?.pm10?.value,
      no2: aqi.pollutants?.no2?.value,
      o3: aqi.pollutants?.o3?.value,
      co: aqi.pollutants?.co?.value,
      so2: aqi.pollutants?.so2?.value,
      pollution_risk: riskAssessment.pollutionRisk,
      heat_risk: riskAssessment.heatRisk,
      uv_risk: riskAssessment.uvRisk,
      overall_risk: riskAssessment.overallRisk,
      advisory,
    });
  } catch (histErr) {
    console.warn('Could not record advisory history:', histErr);
  }

  return advisory;
}
