import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeScene, GlobeSceneHandle } from './components/Globe/GlobeScene';
import { GlobeLoader } from './components/Globe/GlobeLoader';
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

  // Globe readiness & sequential reveal orchestration
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

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

  // Staged sequential reveal callbacks
  const handleGlobeReady = useCallback(() => {
    setIsGlobeReady(true);
  }, []);

  const handleStartReveal = useCallback(() => {
    setShowUI(true);
  }, []);

  const handleLoaderFinished = useCallback(() => {
    setIsLoaderFinished(true);
  }, []);

  // Automatically select and fly to a random global city once Earth model and UI have sequentially loaded
  const initialFlightTriggeredRef = useRef(false);
  useEffect(() => {
    if (showUI && !initialFlightTriggeredRef.current) {
      initialFlightTriggeredRef.current = true;
      const timer = setTimeout(() => {
        const initialRandomCity = getRandomLocation();
        handleSelectLocation(initialRandomCity);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [showUI, handleSelectLocation]);

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
        onGlobeReady={handleGlobeReady}
      />

      {/* 0. Full-Viewport Mesmerising Celestial Loading Screen (Highest stacking priority) */}
      {!isLoaderFinished && (
        <GlobeLoader
          isGlobeReady={isGlobeReady}
          onStartReveal={handleStartReveal}
          onFinished={handleLoaderFinished}
        />
      )}

      {/* 2. Top Bar Controls: Location Search near top-center - Sequentially revealed */}
      {showUI && (
        <LocationSearch
          onSelectLocation={handleSelectLocation}
          selectedLocationName={selectedLocation?.name}
          onRandomLocation={handleSelectRandomLocation}
          isFlying={isFlying}
        />
      )}

      {/* 3. Top-Right: Fixed Profile Avatar Trigger - Sequentially revealed */}
      {showUI && (
        <ProfileButton
          profile={profile}
          onClick={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* Initial Space Ambient Hint (visible only when UI is revealed and no location is selected) */}
      <AnimatePresence>
        {showUI && !selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center flex flex-col items-center gap-2.5 pointer-events-auto"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons if location is selected */}
      <AnimatePresence>
        {showUI && selectedLocation && showPanels && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="fixed bottom-5 left-5 z-30 flex items-center gap-2 pointer-events-auto"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Floating Glassmorphism Side HUD Wings (Rendered once camera flight settles) */}
      <AnimatePresence>
        {showPanels && (
          <>
            {/* Left Wing HUD: AQI & Health Risk Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-20 left-4 sm:left-6 z-20 w-[320px] sm:w-[330px] space-y-2.5 pointer-events-none max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-start pb-4"
            >
              {aqi && <AQIPanel data={aqi} />}
              {riskAssessment && <RiskPanel data={riskAssessment} />}
            </motion.div>

            {/* Right Wing HUD: Atmospheric Weather & AI Health Advisory */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="fixed top-20 right-4 sm:right-6 z-20 w-[320px] sm:w-[340px] space-y-2.5 pointer-events-none max-h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-end pb-4"
            >
              {weather && <WeatherPanel data={weather} />}
              {advisory && <AIAdvisoryPanel data={advisory} />}
            </motion.div>

            {/* Docked Floating 7-Day History & Trends Panel at Bottom Center (Expands Upward) */}
            {trends && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-[92vw] max-w-xl pointer-events-auto flex flex-col-reverse items-center"
              >
                <HistoryPanel data={trends} />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

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
