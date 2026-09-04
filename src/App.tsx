import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import { LocationResult, getRandomLocation } from './services/geocodingService';
import { Compass, RotateCcw, Shuffle } from 'lucide-react';

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

  // Handle location selection from Search bar or random picker
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

  // Pick a fresh random location
  const handleSelectRandomLocation = useCallback(() => {
    const randomLoc = getRandomLocation(selectedLocation?.name);
    handleSelectLocation(randomLoc);
  }, [handleSelectLocation, selectedLocation]);

  // Return to global planetary view and reset camera to space orbit
  const handleExitDestination = useCallback(() => {
    resetSelection();
    if (globeRef.current) {
      globeRef.current.resetToOrbit();
    }
  }, [resetSelection]);

  // Automatically select and fly to a random global city on initial UI open
  const initialMountRef = useRef(false);
  useEffect(() => {
    if (!initialMountRef.current) {
      initialMountRef.current = true;
      const initialRandomCity = getRandomLocation();
      handleSelectLocation(initialRandomCity);
    }
  }, [handleSelectLocation]);

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
        showMarker={showMarker && !isProfileModalOpen}
        onMarkerReveal={triggerMarkerReveal}
        onFlightComplete={finishFlight}
      />

      {/* 2. Top Bar Controls: Location Search near top-center */}
      <LocationSearch
        onSelectLocation={handleSelectLocation}
        selectedLocationName={selectedLocation?.name}
        onRandomLocation={handleSelectRandomLocation}
        isFlying={isFlying}
      />

      {/* 3. Top-Right: Fixed Profile Avatar Trigger */}
      <ProfileButton
        profile={profile}
        onClick={() => setIsProfileModalOpen(true)}
      />

      {/* Initial Space Ambient Hint (visible only when no location is selected) */}
      {!selectedLocation && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center animate-in fade-in duration-1000 flex flex-col items-center gap-2.5 pointer-events-auto">
          <div className="px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-lg">
            <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Drag to rotate planet • Search any city to explore environmental intelligence</span>
          </div>
          <button
            onClick={handleSelectRandomLocation}
            disabled={isFlying}
            className="px-4 py-1.5 rounded-full bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-xs font-medium text-emerald-300 hover:text-white flex items-center gap-2 shadow-lg backdrop-blur-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Explore a Random Location</span>
          </button>
        </div>
      )}

      {/* Action buttons if location is selected */}
      {selectedLocation && showPanels && (
        <div className="fixed bottom-5 left-5 z-30 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleExitDestination}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-all shadow-xl flex items-center gap-2 cursor-pointer"
            title="Return to planetary view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Exit Destination View</span>
          </button>
          <button
            onClick={handleSelectRandomLocation}
            disabled={isFlying}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold backdrop-blur-md transition-all shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Explore another random city"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Random City</span>
          </button>
        </div>
      )}

      {/* 4. Floating Glassmorphism Side HUD Wings (Rendered once camera flight settles) */}
      {showPanels && (
        <>
          {/* Left Wing HUD: AQI & Health Risk Analysis */}
          <div className="fixed top-20 left-4 sm:left-6 z-20 w-[320px] sm:w-[330px] space-y-2.5 pointer-events-none max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-start pb-4">
            {aqi && <AQIPanel data={aqi} />}
            {riskAssessment && <RiskPanel data={riskAssessment} />}
          </div>

          {/* Right Wing HUD: Atmospheric Weather & AI Health Advisory */}
          <div className="fixed top-20 right-4 sm:right-6 z-20 w-[320px] sm:w-[340px] space-y-2.5 pointer-events-none max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-end pb-4">
            {weather && <WeatherPanel data={weather} />}
            {advisory && <AIAdvisoryPanel data={advisory} />}
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
