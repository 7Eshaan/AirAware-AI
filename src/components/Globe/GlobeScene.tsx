import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { LocationMarker } from './LocationMarker';
import { GlobeControls } from './GlobeControls';
import { SpaceBackground } from './SpaceBackground';
import { GlobeLoader } from './GlobeLoader';
import { flyCameraToLocation } from '../../utils/cameraFlight';
import gsap from 'gsap';

export interface GlobeSceneHandle {
  flyToLocation: (
    latitude: number,
    longitude: number,
    onMarkerReveal?: () => void,
    onComplete?: () => void
  ) => void;
  resetToOrbit: () => void;
}

interface GlobeSceneProps {
  selectedLocation: {
    name: string;
    latitude: number;
    longitude: number;
    aqi?: number;
  } | null;
  isFlying: boolean;
  showMarker: boolean;
  onMarkerReveal: () => void;
  onFlightComplete: () => void;
}

// Inner scene wrapper to access useThree camera
interface SceneContentProps {
  selectedLocation: GlobeSceneProps['selectedLocation'];
  isFlying: boolean;
  showMarker: boolean;
  onControlsReady: (controls: OrbitControlsImpl) => void;
  earthGroupRef: React.RefObject<THREE.Group | null>;
}

const SceneContent: React.FC<SceneContentProps> = ({
  selectedLocation,
  isFlying,
  showMarker,
  onControlsReady,
  earthGroupRef,
}) => {
  return (
    <>
      {/* Cinematic Deep Space Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={2.2} />
      <directionalLight position={[-2, 1, 4]} intensity={1.0} />
      <directionalLight position={[-5, -2, -4]} intensity={0.35} />

      {/* Realistic Deep Space Environment */}
      <SpaceBackground />

      {/* Rotating Earth Group */}
      <group ref={earthGroupRef}>
        <Earth />
        <Atmosphere />

        {/* 3D Location Marker on Earth's surface */}
        {selectedLocation && (
          <LocationMarker
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            locationName={selectedLocation.name}
            aqi={selectedLocation.aqi}
            visible={showMarker}
          />
        )}
      </group>

      {/* Camera & Orbit Controls */}
      <GlobeControls
        earthGroupRef={earthGroupRef}
        isFlying={isFlying}
        hasSelectedLocation={Boolean(selectedLocation)}
        onControlsReady={onControlsReady}
      />
    </>
  );
};

export const GlobeScene = forwardRef<GlobeSceneHandle, GlobeSceneProps>(
  ({ selectedLocation, isFlying, showMarker, onMarkerReveal, onFlightComplete }, ref) => {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const earthGroupRef = useRef<THREE.Group | null>(null);

    const pendingFlightRef = useRef<{
      latitude: number;
      longitude: number;
      onReveal?: () => void;
      onComplete?: () => void;
    } | null>(null);

    const executeFlight = useCallback(
      (latitude: number, longitude: number, onReveal?: () => void, onComplete?: () => void) => {
        if (!cameraRef.current || !controlsRef.current) {
          pendingFlightRef.current = { latitude, longitude, onReveal, onComplete };
          return;
        }

        pendingFlightRef.current = null;
        flyCameraToLocation({
          camera: cameraRef.current,
          controls: controlsRef.current,
          earthGroup: earthGroupRef.current,
          latitude,
          longitude,
          cameraDistance: 2.6,
          onMarkerReveal: () => {
            onMarkerReveal();
            if (onReveal) onReveal();
          },
          onComplete: () => {
            onFlightComplete();
            if (onComplete) onComplete();
          },
        });
      },
      [onMarkerReveal, onFlightComplete]
    );

    const checkPendingFlight = useCallback(() => {
      if (cameraRef.current && controlsRef.current && pendingFlightRef.current) {
        const { latitude, longitude, onReveal, onComplete } = pendingFlightRef.current;
        executeFlight(latitude, longitude, onReveal, onComplete);
      }
    }, [executeFlight]);

    const handleControlsReady = useCallback(
      (controls: OrbitControlsImpl) => {
        controlsRef.current = controls;
        checkPendingFlight();
      },
      [checkPendingFlight]
    );

    // Expose flyToLocation & resetToOrbit methods to parent via ref
    useImperativeHandle(ref, () => ({
      flyToLocation: (latitude, longitude, onReveal, onComplete) => {
        executeFlight(latitude, longitude, onReveal, onComplete);
      },
      resetToOrbit: () => {
        if (!cameraRef.current || !controlsRef.current) return;
        gsap.killTweensOf(cameraRef.current.position);
        gsap.killTweensOf(controlsRef.current.target);

        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.0,
          ease: 'power2.out',
          onUpdate: () => controlsRef.current?.update(),
        });

        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 0,
          z: 4.5,
          duration: 1.6,
          ease: 'power3.inOut',
          onUpdate: () => controlsRef.current?.update(),
        });
      },
    }));

    return (
      <div
        className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0"
        style={{
          background: '#000000',
          isolation: 'isolate',
        }}
      >
        <Canvas
          camera={{
            position: [0, 0, 4.5],
            fov: 45,
            near: 0.1,
            far: 1000,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
            checkPendingFlight();
          }}
        >
          <SceneContent
            selectedLocation={selectedLocation}
            isFlying={isFlying}
            showMarker={showMarker}
            onControlsReady={handleControlsReady}
            earthGroupRef={earthGroupRef}
          />
        </Canvas>

        {/* Mesmerising Celestial Planetary Loading Overlay */}
        <GlobeLoader />
      </div>
    );
  }
);

GlobeScene.displayName = 'GlobeScene';
