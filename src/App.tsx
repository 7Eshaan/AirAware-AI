import React, { useRef, useState, useCallback } from 'react';
import { GlobeScene, GlobeSceneHandle } from './components/Globe/GlobeScene';
import { LocationSearch } from './components/Search/LocationSearch';
import { ProfileButton } from './components/profile/ProfileButton';
import { ProfileModal } from './components/profile/ProfileModal';
import { AQIPanel } from './components/Panels/AQIPanel';
import { WeatherPanel } from './components/Panels/WeatherPanel';
import { RiskPanel } from './components/Panels/RiskPanel';
import { AIAdvisoryPanel } from './components/Panels/AIAdvisoryPanel';
import { HistoryPanel } from './components/Panels/HistoryPanel';

import { useLocationSearch } from './hooks/useLocationSearch';
import { useEnvironmentalData } from './hooks/useEnvironmentalData';
import { useUserProfile } from './hooks/useUserProfile';
import { LocationResult } from './services/geocodingService';
import { Compass, X, RotateCcw } from 'lucide-react';

export function App() {
  const globeRef = useRef<GlobeSceneHandle>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User Profile
  const {
    profile,
    presets,
    activePresetId,
    updateProfile,
    applyPreset,
  } = useUserProfile();

  // Location search & camera flight state
  const {
    selectedLocation,
    isFlying,
    showMarker,
    showPanels,
    startFlight,
    triggerMarkerReveal,
    finishFlight,
    resetSelection,
  } = useLocationSearch();

  // Environmental data & risk engine
  const {
    weather,
    aqi,
    trends,
    riskAssessment,
    advisory,
    fetchEnvironmentForLocation,
    recalculateForProfile,
  } = useEnvironmentalData();

  // Handle location selection from Search bar
  const handleSelectLocation = useCallback(
    (loc: LocationResult) => {
      startFlight(loc);

      // 1. Parallel Telemetry Ingestion during camera flight
      fetchEnvironmentForLocation(loc.latitude, loc.longitude, loc.name, profile);

      // 2. Trigger 3D Earth Camera Flight
      if (globeRef.current) {
        globeRef.current.flyToLocation(
          loc.latitude,
          loc.longitude,
          () => triggerMarkerReveal(),
          () => finishFlight()
        );
      }
    },
    [startFlight, fetchEnvironmentForLocation, profile, triggerMarkerReveal, finishFlight]
  );

  // When user updates their health profile from modal
  const handleUpdateProfile = useCallback(
    (newProfile: typeof profile) => {
      updateProfile(newProfile);
      if (selectedLocation) {
        recalculateForProfile(selectedLocation.name, newProfile);
      }
    },
    [updateProfile, selectedLocation, recalculateForProfile]
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] text-white select-none">
      {/* 1. Full-Screen 3D Interactive Earth Canvas */}
      <GlobeScene
        ref={globeRef}
        selectedLocation={
          selectedLocation
            ? {
                name: selectedLocation.name,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                aqi: aqi?.aqi,
              }
            : null
        }
        isFlying={isFlying}
        showMarker={showMarker}
        onMarkerReveal={triggerMarkerReveal}
        onFlightComplete={finishFlight}
      />

      {/* 2. Top Bar Controls: Location Search near top-center */}
      <LocationSearch
        onSelectLocation={handleSelectLocation}
        isFlying={isFlying}
      />

      {/* 3. Top-Right: Fixed Profile Avatar Trigger */}
      <ProfileButton
        profile={profile}
        onClick={() => setIsProfileModalOpen(true)}
      />

      {/* Initial Space Ambient Hint (visible only when no location is selected yet) */}
      {!selectedLocation && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none text-center animate-in fade-in duration-1000">
          <div className="px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-lg">
            <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Drag to rotate planet • Search any city to explore environmental intelligence</span>
          </div>
        </div>
      )}

      {/* Reset view button if location is selected */}
      {selectedLocation && showPanels && (
        <button
          onClick={resetSelection}
          className="fixed bottom-5 left-5 z-30 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-all shadow-xl flex items-center gap-2 cursor-pointer pointer-events-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Exit Destination View</span>
        </button>
      )}

      {/* 4. Floating Glassmorphism Data Panels (Rendered once camera flight settles) */}
      {showPanels && (
        <>
          <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto lg:overflow-visible">
            {/* Top spacer for search bar */}
            <div className="h-16 shrink-0" />

            {/* Main Side Wings around Central Earth */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full my-auto">
              {/* Left Column: AQI Panel & Risk Panel */}
              <div className="lg:col-span-3 space-y-3.5 flex flex-col items-center lg:items-start">
                {aqi && <AQIPanel data={aqi} />}
                {riskAssessment && <RiskPanel data={riskAssessment} />}
              </div>

              {/* Middle Spacer: Leaves 3D Earth Globe and City Marker completely clear in the center */}
              <div className="hidden lg:block lg:col-span-5 h-full pointer-events-none" />

              {/* Right Column: Weather Panel & AI Advisory */}
              <div className="lg:col-span-4 space-y-3.5 flex flex-col items-center lg:items-end">
                {weather && <WeatherPanel data={weather} />}
                {advisory && <AIAdvisoryPanel data={advisory} />}
              </div>
            </div>

            {/* Bottom spacer for docked History Drawer */}
            <div className="h-16 shrink-0" />
          </div>

          {/* Docked Floating 7-Day History & Trends Panel at Bottom Center (Expands Upward) */}
          {trends && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-[92vw] max-w-xl pointer-events-auto flex flex-col-reverse items-center">
              <HistoryPanel data={trends} />
            </div>
          )}
        </>
      )}

      {/* 5. Health Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        presets={presets}
        activePresetId={activePresetId}
        onUpdateProfile={handleUpdateProfile}
        onSelectPreset={applyPreset}
      />
    </div>
  );
}

export default App;
