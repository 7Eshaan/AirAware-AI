import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Earth } from './Earth';
import { Clouds } from './Clouds';
import { Atmosphere } from './Atmosphere';
import { LocationMarker } from './LocationMarker';
import { GlobeControls } from './GlobeControls';
import { flyCameraToLocation } from '../../utils/cameraFlight';

export interface GlobeSceneHandle {
  flyToLocation: (
    latitude: number,
    longitude: number,
    onMarkerReveal?: () => void,
    onComplete?: () => void
  ) => void;
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

      {/* Deep Space Background Starfield */}
      <Stars
        radius={300}
        depth={60}
        count={2500}
        factor={6}
        saturation={0}
        fade
        speed={0.8}
      />

      {/* Rotating Earth Group */}
      <group ref={earthGroupRef}>
        <Earth />
        <Clouds isFlying={isFlying} />
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

    const handleControlsReady = useCallback((controls: OrbitControlsImpl) => {
      controlsRef.current = controls;
    }, []);

    // Expose flyToLocation method to parent via ref
    useImperativeHandle(ref, () => ({
      flyToLocation: (latitude, longitude, onReveal, onComplete) => {
        if (!cameraRef.current || !controlsRef.current) return;

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
    }));

    return (
      <div className="absolute inset-0 w-full h-full bg-[#030712] overflow-hidden">
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
      </div>
    );
  }
);

GlobeScene.displayName = 'GlobeScene';
