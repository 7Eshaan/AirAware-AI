import { useState, useCallback } from 'react';
import { LocationResult } from '../services/geocodingService';

export function useLocationSearch() {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const [showMarker, setShowMarker] = useState(false);
  const [showPanels, setShowPanels] = useState(false);

  const startFlight = useCallback((location: LocationResult) => {
    setSelectedLocation(location);
    setIsFlying(true);
    setShowMarker(false);
    setShowPanels(false);
  }, []);

  const triggerMarkerReveal = useCallback(() => {
    setShowMarker(true);
  }, []);

  const finishFlight = useCallback(() => {
    setIsFlying(false);
    setShowPanels(true);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedLocation(null);
    setIsFlying(false);
    setShowMarker(false);
    setShowPanels(false);
  }, []);

  return {
    selectedLocation,
    isFlying,
    showMarker,
    showPanels,
    startFlight,
    triggerMarkerReveal,
    finishFlight,
    resetSelection,
  };
}
