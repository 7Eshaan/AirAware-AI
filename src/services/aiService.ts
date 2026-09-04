import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { UserHealthProfile } from '../types/profile';
import { RiskAssessmentData } from '../types/risk';
import { AIAdvisory } from '../types/advisory';

/**
 * Phase 4 Service: AI Integration & Prompt Architecture
 * 
 * Future Integration:
 * Connects to Google Gemini API (or OpenAI/Anthropic):
 * e.g. POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
 * 
 * In this base architecture, this file maintains the exact prompt structure,
 * payload formatting, and response schema required for the future LLM call.
 */

export interface AIPromptPayload {
  systemPrompt: string;
  userContext: {
    location: string;
    weather: WeatherData;
    aqi: AQIData;
    userProfile: UserHealthProfile;
    riskAssessment: RiskAssessmentData;
  };
}

export function buildAIPrompt(
  location: string,
  weather: WeatherData,
  aqi: AQIData,
  userProfile: UserHealthProfile,
  riskAssessment: RiskAssessmentData
): AIPromptPayload {
  return {
    systemPrompt: `You are AirAware AI, an evidence-based clinical environmental health intelligence system.
Generate a personalized, empathetic, yet actionable health advisory for a user based on their specific health conditions, occupation, and live atmospheric metrics.
Always provide:
1. Contextual summary (2-3 sentences)
2. 3-4 specific recommended actions
3. 2-3 specific activities to avoid
4. Recommended safe outdoor time window
5. Hydration target in liters
6. Mask recommendation (None, Recommended, Mandatory N95/FFP2)`,
    userContext: {
      location,
      weather,
      aqi,
      userProfile,
      riskAssessment,
    },
  };
}

/**
 * Generates an AI advisory.
 * Simulates LLM inference latency (600ms) while dynamically crafting
 * rich guidance tailored to the exact profile & environmental parameters.
 */
export async function generateAIAdvisory(
  location: string,
  weather: WeatherData,
  aqi: AQIData,
  userProfile: UserHealthProfile,
  riskAssessment: RiskAssessmentData
): Promise<AIAdvisory> {
  // Simulate network & LLM token generation latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const hasAsthma = userProfile.healthConditions.includes('Asthma');
  const hasHeart = userProfile.healthConditions.includes('Heart Condition');
  const isOutdoor = userProfile.occupation === 'Outdoor Worker' || userProfile.occupation === 'Construction Worker';
  const isAthlete = userProfile.occupation === 'Athlete' || userProfile.activityLevel === 'Outdoor Exercise';
  const isSenior = userProfile.ageGroup === 'Senior Citizen';

  let summary = '';
  let headline = '';
  const recommendedActions: string[] = [];
  const considerAvoiding: string[] = [];
  let maskRecommendation: 'None' | 'Recommended' | 'Mandatory N95/FFP2' = 'None';
  let hydrationTarget = 2.5;

  // Tailored logic mirroring LLM behavior
  if (riskAssessment.overallRisk === 'High' || riskAssessment.overallRisk === 'Very High') {
    headline = 'Elevated Caution Advised for Outdoor Exposure';
    if (hasAsthma && isOutdoor) {
      summary = `Based on your profile as an outdoor worker with asthma in ${location}, outdoor exposure requires heightened vigilance today. Ambient AQI (${aqi.aqi}) and PM2.5 concentrations (${aqi.pollutants.pm25.value} µg/m³) are elevated, which can accelerate airway constriction during physical exertion. Ambient temperature of ${weather.temperature}°C adds compounding thermal stress.`;
      recommendedActions.push('Keep quick-relief rescue inhaler (bronchodilator) accessible at all times during work shifts.');
      recommendedActions.push('Wear a well-fitted N95 or FFP2 respirator when working in outdoor dusty or vehicular areas.');
      recommendedActions.push('Take 10-minute breaks in air-conditioned or filtered indoor rest areas every 60-90 minutes.');
      recommendedActions.push('Increase fluid intake with electrolyte-balanced water throughout the day.');
      considerAvoiding.push('Strenuous continuous physical lifting without periodic shaded recovery.');
      considerAvoiding.push('Working in direct downwind proximity to idling diesel machinery or high-traffic corridors.');
      maskRecommendation = 'Mandatory N95/FFP2';
      hydrationTarget = 3.5;
    } else if (hasHeart || isSenior) {
      summary = `Current conditions in ${location} present elevated cardiovascular and particulate stress. Ambient PM2.5 (${aqi.pollutants.pm25.value} µg/m³) combined with temperature (${weather.temperature}°C) elevates heart rate and arterial resistance. Minimize unneeded outdoor excursions.`;
      recommendedActions.push('Remain indoors with high-efficiency particulate air (HEPA) filtration running.');
      recommendedActions.push('Check blood pressure and monitor for chest tightness or fatigue.');
      recommendedActions.push('Stay well-hydrated with room-temperature water.');
      considerAvoiding.push('Walking outdoors between 11:00 AM and 4:00 PM during peak solar and heat hours.');
      considerAvoiding.push('Rapid transitions from cold air-conditioned rooms to extreme outdoor heat.');
      maskRecommendation = 'Recommended';
      hydrationTarget = 2.8;
    } else if (isAthlete) {
      summary = `Atmospheric particulates are elevated in ${location} with an AQI of ${aqi.aqi}. High-intensity aerobic workouts increase minute ventilation up to 10-fold, pulling fine PM2.5 deep into alveoli.`;
      recommendedActions.push('Reschedule heavy endurance or tempo runs to early morning before photochemical smog rises.');
      recommendedActions.push('Shift high-intensity cardio sessions indoors to a facility with air filtration.');
      recommendedActions.push('Pre-hydrate with electrolytes before and immediately after any training.');
      considerAvoiding.push('Outdoor interval training or tempo sprints during peak afternoon hours.');
      considerAvoiding.push('Running along major urban arterial roads.');
      maskRecommendation = 'Recommended';
      hydrationTarget = 3.8;
    } else {
      summary = `Based on your current environmental conditions and profile, outdoor exposure may require additional caution today. Air quality is elevated (AQI ${aqi.aqi}), and prolonged outdoor activity may increase exposure to pollutants. Consider reducing intense outdoor activity and monitoring changes in air quality.`;
      recommendedActions.push('Stay consistently hydrated throughout the workday.');
      recommendedActions.push('Reduce prolonged or heavy outdoor exertion, especially during peak commute hours.');
      recommendedActions.push('Check real-time air quality before planning evening outdoor activities.');
      considerAvoiding.push('Intense outdoor exercise during peak pollution periods.');
      considerAvoiding.push('Long exposure near congested high-traffic intersections.');
      maskRecommendation = 'Recommended';
      hydrationTarget = 3.0;
    }
  } else if (riskAssessment.overallRisk === 'Moderate') {
    headline = 'Moderate Conditions — Standard Awareness Advised';
    summary = `Environmental conditions in ${location} are acceptable for general populations, with moderate AQI (${aqi.aqi}) and temperature (${weather.temperature}°C). Sensitive individuals should be conscious of midday ozone and UV levels.`;
    recommendedActions.push('Maintain regular hydration with 2.5–3 liters of water throughout the day.');
    recommendedActions.push('Apply broad-spectrum SPF 30+ sunscreen if outdoors around midday (UV index ${weather.uvIndex}).');
    recommendedActions.push('Keep indoor spaces ventilated during early morning hours when air is cleanest.');
    considerAvoiding.push('Unprotected midday sun exposure exceeding 30 minutes.');
    considerAvoiding.push('Strenuous outdoor exercise directly along arterial roads during rush hours.');
    maskRecommendation = hasAsthma ? 'Recommended' : 'None';
    hydrationTarget = 2.8;
  } else {
    headline = 'Optimal Environmental Conditions';
    summary = `Air quality in ${location} is in the Good range (AQI ${aqi.aqi}), and meteorological parameters are favorable. Atmospheric particulate and thermal burdens are minimal.`;
    recommendedActions.push('Take advantage of pristine air quality for outdoor workouts, walking, and recreation.');
    recommendedActions.push('Open windows for natural home and office ventilation.');
    recommendedActions.push('Standard hydration of 2–2.5 liters.');
    considerAvoiding.push('Prolonged direct midday sun exposure without basic sunscreen.');
    maskRecommendation = 'None';
    hydrationTarget = 2.2;
  }

  return {
    headline,
    summary,
    recommendedActions,
    considerAvoiding,
    safeOutdoorWindows: ['06:00 AM – 08:30 AM', '06:30 PM – 08:30 PM'],
    hydrationTargetLiters: hydrationTarget,
    maskRecommendation,
    generatedAt: new Date().toISOString(),
    modelIdentifier: 'AirAware Health-LLM Engine v1.2',
    confidenceScore: 0.94,
  };
}
