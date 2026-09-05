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
import { Compass, RotateCcw, Shuffle, Wind, Thermometer, BarChart3, ChevronDown } from 'lucide-react';

export function App() {
  const globeRef = useRef<GlobeSceneHandle>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Globe readiness & sequential reveal orchestration
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

  // Mobile Telemetry Active Tab: 'air' | 'weather' | 'trends' | 'none'
  const [mobileTab, setMobileTab] = useState<'air' | 'weather' | 'trends' | 'none'>('air');

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
      setMobileTab('air');

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

      {/* 2. Top Header Controls */}
      {showUI && (
        <>
          {/* Mobile Header (< 768px): Unified flex row across top */}
          <header className="fixed top-3 inset-x-2.5 z-30 flex md:hidden items-center gap-2 pointer-events-none">
            <div className="flex-1 min-w-0 pointer-events-auto">
              <LocationSearch
                onSelectLocation={handleSelectLocation}
                selectedLocationName={selectedLocation?.name}
                onRandomLocation={handleSelectRandomLocation}
                isFlying={isFlying}
              />
            </div>
            <div className="shrink-0 pointer-events-auto">
              <ProfileButton
                profile={profile}
                onClick={() => setIsProfileModalOpen(true)}
              />
            </div>
          </header>

          {/* Desktop Header (>= 768px): Centered Search Bar + Top-Right Profile Button */}
          <div className="hidden md:block pointer-events-none">
            {/* Dead-centered search bar in viewport */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 w-[90vw] max-w-lg lg:max-w-xl pointer-events-auto">
              <LocationSearch
                onSelectLocation={handleSelectLocation}
                selectedLocationName={selectedLocation?.name}
                onRandomLocation={handleSelectRandomLocation}
                isFlying={isFlying}
              />
            </div>

            {/* Top-Right Profile button - aligned precisely with the right-wing HUD panel at right-4 sm:right-6 */}
            <div className="fixed top-6 right-4 sm:right-6 z-30 pointer-events-auto">
              <ProfileButton
                profile={profile}
                onClick={() => setIsProfileModalOpen(true)}
              />
            </div>
          </div>
        </>
      )}

      {/* Initial Space Ambient Hint (visible only when UI is revealed and no location is selected) */}
      <AnimatePresence>
        {showUI && !selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="fixed bottom-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-20 text-center flex flex-col items-center gap-2.5 pointer-events-auto"
          >
            <div className="px-4 py-2 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-lg">
              <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="hidden sm:inline">Drag to rotate planet • Search any city to explore environmental intelligence</span>
              <span className="sm:hidden">Drag planet to explore • Search any city</span>
            </div>
            <button
              onClick={handleSelectRandomLocation}
              disabled={isFlying}
              className="px-4 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 text-xs font-medium text-emerald-300 hover:text-white flex items-center gap-2 shadow-lg backdrop-blur-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Explore a Random Location</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4a. DESKTOP HUD: Floating Glassmorphism Side HUD Wings & Bottom Controls (md:flex) */}
      <AnimatePresence>
        {showPanels && (
          <div className="hidden md:block">
            {/* Action buttons on desktop */}
            {selectedLocation && (
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
              </motion.div>
            )}

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
          </div>
        )}
      </AnimatePresence>

      {/* 4b. MOBILE HUD: Thumb-Friendly Segmented Telemetry Drawer (md:hidden) */}
      <AnimatePresence>
        {showPanels && selectedLocation && (
          <div className="md:hidden">
            {/* Active Drawer Sheet */}
            <AnimatePresence mode="wait">
              {mobileTab !== 'none' && (
                <motion.div
                  key={mobileTab}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed bottom-[66px] inset-x-2.5 z-25 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] p-2.5 flex flex-col gap-2.5 pointer-events-auto"
                >
                  {/* Sheet Header: Location badge & Collapse button */}
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate max-w-[240px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="truncate">{selectedLocation.name}</span>
                      {aqi && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                          AQI {aqi.aqi}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setMobileTab('none')}
                      className="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Hide</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Tab: Air & Risk */}
                  {mobileTab === 'air' && (
                    <div className="space-y-2.5 w-full flex flex-col items-center">
                      {aqi && <AQIPanel data={aqi} />}
                      {riskAssessment && <RiskPanel data={riskAssessment} />}
                    </div>
                  )}

                  {/* Tab: Weather & AI Advisory */}
                  {mobileTab === 'weather' && (
                    <div className="space-y-2.5 w-full flex flex-col items-center">
                      {weather && <WeatherPanel data={weather} />}
                      {advisory && <AIAdvisoryPanel data={advisory} />}
                    </div>
                  )}

                  {/* Tab: Trends & History */}
                  {mobileTab === 'trends' && (
                    <div className="w-full flex justify-center">
                      {trends && <HistoryPanel data={trends} defaultExpanded={true} />}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Collapsed Pill (when drawer is hidden, letting user view 3D globe freely) */}
            {mobileTab === 'none' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed bottom-[66px] left-1/2 -translate-x-1/2 z-25 pointer-events-auto"
              >
                <button
                  onClick={() => setMobileTab('air')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-emerald-500/40 backdrop-blur-xl text-xs text-white shadow-xl cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-emerald-300 truncate max-w-[150px]">{selectedLocation.name}</span>
                  <span className="text-slate-400 text-[10px]">• Tap for Telemetry</span>
                </button>
              </motion.div>
            )}

            {/* Mobile Fixed Bottom Segmented Bar */}
            <div className="fixed bottom-2.5 inset-x-2.5 z-30 pointer-events-auto flex items-center justify-between gap-1 p-1 rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-0.5 flex-1 min-w-0">
                <button
                  onClick={() => setMobileTab('air')}
                  className={`flex-1 py-1.5 px-1 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    mobileTab === 'air'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wind className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                  <span>Air</span>
                </button>

                <button
                  onClick={() => setMobileTab('weather')}
                  className={`flex-1 py-1.5 px-1 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    mobileTab === 'weather'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Thermometer className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <span>Weather</span>
                </button>

                <button
                  onClick={() => setMobileTab('trends')}
                  className={`flex-1 py-1.5 px-1 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    mobileTab === 'trends'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  <span>Trends</span>
                </button>

                <button
                  onClick={() => setMobileTab('none')}
                  className={`flex-1 py-1.5 px-1 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    mobileTab === 'none'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>Globe</span>
                </button>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-white/15 shrink-0 mx-0.5" />

              {/* Quick Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleExitDestination}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Return to planetary view"
                  aria-label="Exit destination"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
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
