import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { UserHealthProfile } from '../types/profile';
import { RiskAssessmentData, RiskLevel, RiskCategoryResult } from '../types/risk';

/**
 * Phase 3 Deterministic Risk Engine
 * 
 * Combines:
 * - Environmental data (AQI, PM2.5, Heat Index, UV Index)
 * - User Profile (Age, Conditions, Occupation, Activity Level)
 * 
 * Calculates:
 * - pollutionRisk
 * - heatRisk
 * - uvRisk
 * - weatherRisk / overallRisk
 */

function scoreToLevel(score: number): RiskLevel {
  if (score < 35) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'High';
  return 'Very High';
}

export function calculateRiskAssessment(
  weather: WeatherData,
  aqi: AQIData,
  profile: UserHealthProfile
): RiskAssessmentData {
  const { ageGroup, healthConditions, occupation, activityLevel } = profile;

  // 1. Calculate Multipliers based on User Profile
  let ageMultiplier = 1.0;
  if (ageGroup === 'Child' || ageGroup === 'Senior Citizen') {
    ageMultiplier = 1.35;
  } else if (ageGroup === 'Teen') {
    ageMultiplier = 1.1;
  }

  // Respiratory vulnerability multiplier
  const hasAsthma = healthConditions.includes('Asthma');
  const hasResp = healthConditions.includes('Respiratory Condition');
  const hasHeart = healthConditions.includes('Heart Condition');
  const hasAllergy = healthConditions.includes('Allergy');

  let respMultiplier = 1.0;
  if (hasAsthma) respMultiplier += 0.45;
  if (hasResp) respMultiplier += 0.4;
  if (hasAllergy) respMultiplier += 0.2;

  let cardioMultiplier = 1.0;
  if (hasHeart) cardioMultiplier += 0.5;

  // Exposure multiplier based on occupation
  let exposureMultiplier = 1.0;
  if (occupation === 'Outdoor Worker' || occupation === 'Construction Worker' || occupation === 'Delivery Worker') {
    exposureMultiplier = 1.45;
  } else if (occupation === 'Athlete') {
    exposureMultiplier = 1.35;
  } else if (occupation === 'Indoor Worker') {
    exposureMultiplier = 0.85;
  }

  // Activity level multiplier
  let activityMultiplier = 1.0;
  if (activityLevel === 'Heavy Outdoor Work') {
    activityMultiplier = 1.4;
  } else if (activityLevel === 'Outdoor Exercise') {
    activityMultiplier = 1.3;
  } else if (activityLevel === 'Mostly Indoors') {
    activityMultiplier = 0.85;
  }

  // --- 2. Calculate Pollution Risk ---
  // Base environmental pollution factor (0 - 100 based on AQI up to 300)
  const basePollutionScore = Math.min(100, (aqi.aqi / 200) * 60);
  const adjustedPollutionScore = Math.min(
    100,
    basePollutionScore * ageMultiplier * respMultiplier * ((exposureMultiplier + activityMultiplier) / 2)
  );
  const pollutionLevel = scoreToLevel(adjustedPollutionScore);

  const pollutionFactors: string[] = [];
  if (aqi.aqi > 100) pollutionFactors.push(`Elevated AQI (${aqi.aqi} - ${aqi.dominantPollutant})`);
  if (hasAsthma || hasResp) pollutionFactors.push('Elevated bronchial hyper-responsiveness recorded in profile');
  if (occupation === 'Outdoor Worker' || occupation === 'Construction Worker') pollutionFactors.push('High daily outdoor ambient particulate exposure');

  const pollutionDetails: RiskCategoryResult = {
    level: pollutionLevel,
    score: Math.round(adjustedPollutionScore),
    title: 'Pollution Risk',
    contributingFactors: pollutionFactors.length > 0 ? pollutionFactors : ['Air quality within normal tolerance levels'],
    primaryConcern: hasAsthma
      ? 'Elevated particulate matter (PM2.5) can induce airway inflammation and asthma symptoms.'
      : 'Prolonged particulate inhalation during peak atmospheric stagnation hours.',
  };

  // --- 3. Calculate Heat Risk ---
  // Simple heat index / apparent temperature calculation
  const temp = weather.temperature;
  const humidity = weather.humidity;
  // Base heat score
  let baseHeatScore = 20;
  if (temp > 38) baseHeatScore = 80;
  else if (temp > 33) baseHeatScore = 55;
  else if (temp > 28) baseHeatScore = 40;
  else baseHeatScore = 15;

  if (humidity > 60 && temp > 28) {
    baseHeatScore += 15;
  }

  const adjustedHeatScore = Math.min(
    100,
    baseHeatScore * ageMultiplier * cardioMultiplier * ((exposureMultiplier + activityMultiplier) / 2)
  );
  const heatLevel = scoreToLevel(adjustedHeatScore);

  const heatFactors: string[] = [];
  if (temp >= 30) heatFactors.push(`Ambient temperature ${temp}°C (feels like ${weather.feelsLike}°C)`);
  if (humidity >= 55) heatFactors.push(`Moderate relative humidity (${humidity}%) restricts evaporative cooling`);
  if (hasHeart) heatFactors.push('Cardiovascular vulnerability under elevated thermal strain');

  const heatDetails: RiskCategoryResult = {
    level: heatLevel,
    score: Math.round(adjustedHeatScore),
    title: 'Heat Risk',
    contributingFactors: heatFactors.length > 0 ? heatFactors : ['Thermal conditions within comfortable physiological range'],
    primaryConcern: temp >= 32
      ? 'Prolonged outdoor exposure promotes fluid loss, thermal fatigue, and metabolic stress.'
      : 'Low thermal stress expected under current conditions.',
  };

  // --- 4. Calculate UV Risk ---
  const uv = weather.uvIndex;
  let baseUvScore = 15;
  if (uv >= 8) baseUvScore = 80;
  else if (uv >= 6) baseUvScore = 55;
  else if (uv >= 3) baseUvScore = 35;
  else baseUvScore = 15;

  const adjustedUvScore = Math.min(
    100,
    baseUvScore * ((exposureMultiplier + activityMultiplier) / 2) * (ageGroup === 'Child' ? 1.25 : 1.0)
  );
  const uvLevel = scoreToLevel(adjustedUvScore);

  const uvFactors: string[] = [];
  if (uv >= 6) uvFactors.push(`UV Index at ${uv} (Moderate to High solar radiation)`);
  if (exposureMultiplier > 1.2) uvFactors.push('Significant daytime open-sun exposure profile');

  const uvDetails: RiskCategoryResult = {
    level: uvLevel,
    score: Math.round(adjustedUvScore),
    title: 'UV Risk',
    contributingFactors: uvFactors.length > 0 ? uvFactors : ['Low solar UV irradiance detected'],
    primaryConcern: uv >= 6
      ? 'Unprotected outdoor exposure over 25-30 minutes carries elevated risk of erythema and cellular stress.'
      : 'Standard sun protection adequate.',
  };

  // --- 5. Calculate Overall Risk ---
  // Overall is compound weighted score
  const overallScore = Math.min(
    100,
    adjustedPollutionScore * 0.45 + adjustedHeatScore * 0.35 + adjustedUvScore * 0.20
  );
  const overallLevel = scoreToLevel(overallScore);

  const overallFactors: string[] = [
    `Dominant stressor: ${adjustedPollutionScore >= adjustedHeatScore ? 'Particulate Air Quality' : 'Heat Index & Sun Exposure'}`,
    `Personal sensitivity profile multiplier applied`,
  ];

  const overallDetails: RiskCategoryResult = {
    level: overallLevel,
    score: Math.round(overallScore),
    title: 'Overall Environmental Risk',
    contributingFactors: overallFactors,
    primaryConcern: overallLevel === 'High' || overallLevel === 'Very High'
      ? 'Compound environmental stress warrants precautionary protective measures and activity modification.'
      : 'Manageable environmental conditions with standard precautions.',
  };

  return {
    pollutionRisk: pollutionLevel,
    heatRisk: heatLevel,
    uvRisk: uvLevel,
    overallRisk: overallLevel,
    details: {
      pollution: pollutionDetails,
      heat: heatDetails,
      uv: uvDetails,
      overall: overallDetails,
    },
    calculatedAt: new Date().toISOString(),
  };
}
