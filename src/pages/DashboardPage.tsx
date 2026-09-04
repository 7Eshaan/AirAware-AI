import React from 'react';
import { LocationHeader } from '../components/location/LocationHeader';
import { WeatherOverview } from '../components/weather/WeatherOverview';
import { AQIOverview } from '../components/aqi/AQIOverview';
import { RiskAssessment } from '../components/risk/RiskAssessment';
import { AIAdvisoryCard } from '../components/ai/AIAdvisoryCard';
import { HealthProfilePanel } from '../components/profile/HealthProfilePanel';
import { TrendsSection } from '../components/trends/TrendsSection';
import { RecentAlertsSection } from '../components/alerts/RecentAlertsSection';
import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { UserHealthProfile, ProfilePreset } from '../types/profile';
import { RiskAssessmentData } from '../types/risk';
import { AIAdvisory } from '../types/advisory';
import { SevenDayTrendsData } from '../types/trends';
import { PersonalizedAlert } from '../types/alert';
import { CityData } from '../data/mockCities';

interface DashboardPageProps {
  locationName: string;
  cityName: string;
  weather: WeatherData;
  aqi: AQIData;
  userProfile: UserHealthProfile;
  riskAssessment: RiskAssessmentData;
  advisory: AIAdvisory | null;
  trends: SevenDayTrendsData;
  alerts: PersonalizedAlert[];
  isLoading: boolean;
  isGeneratingAdvisory: boolean;
  presets: ProfilePreset[];
  activePresetId: string | null;
  isProfileSaved: boolean;
  onRefreshEnvironment: () => void;
  onSelectCity: (city: CityData) => void;
  onUpdateProfile: (profile: UserHealthProfile) => void;
  onSelectPreset: (preset: ProfilePreset) => void;
  onRefreshAdvisory: () => void;
  onViewAllHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  locationName,
  cityName,
  weather,
  aqi,
  userProfile,
  riskAssessment,
  advisory,
  trends,
  alerts,
  isLoading,
  isGeneratingAdvisory,
  presets,
  activePresetId,
  isProfileSaved,
  onRefreshEnvironment,
  onSelectCity,
  onUpdateProfile,
  onSelectPreset,
  onRefreshAdvisory,
  onViewAllHistory,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Location Search */}
      <LocationHeader
        locationName={locationName}
        cityName={cityName}
        lastUpdated={weather.lastUpdated}
        isLoading={isLoading}
        onRefresh={onRefreshEnvironment}
        onSelectCity={onSelectCity}
      />

      {/* 2. Top Tier Priority: AQI & Personalized Risk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Air Quality Section (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <AQIOverview aqiData={aqi} isLoading={isLoading} />
        </div>

        {/* AI Advisory Section (5 cols on desktop for immediate clinical insight) */}
        <div className="lg:col-span-5">
          <AIAdvisoryCard
            advisory={advisory}
            isGenerating={isGeneratingAdvisory}
            onRefresh={onRefreshAdvisory}
          />
        </div>
      </div>

      {/* 3. Dedicated Risk Assessment Section */}
      <RiskAssessment assessment={riskAssessment} />

      {/* 4. Current Environmental Meteorological Overview */}
      <WeatherOverview weather={weather} isLoading={isLoading} />

      {/* 5. Personalized Health Profile Editor & Presets */}
      <HealthProfilePanel
        profile={userProfile}
        presets={presets}
        activePresetId={activePresetId}
        onUpdateProfile={onUpdateProfile}
        onSelectPreset={onSelectPreset}
        isSaved={isProfileSaved}
      />

      {/* 6. Environmental Trends Section */}
      <TrendsSection trends={trends} />

      {/* 7. Recent Personalized Alerts Preview */}
      <RecentAlertsSection
        alerts={alerts}
        onViewAllHistory={onViewAllHistory}
      />
    </div>
  );
};
