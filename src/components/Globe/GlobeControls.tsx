import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';

interface GlobeControlsProps {
  earthGroupRef: React.RefObject<THREE.Group | null>;
  isFlying?: boolean;
  hasSelectedLocation?: boolean;
  onControlsReady?: (controls: OrbitControlsImpl) => void;
}

export const GlobeControls: React.FC<GlobeControlsProps> = ({
  earthGroupRef,
  isFlying = false,
  hasSelectedLocation = false,
  onControlsReady,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isInteractingRef = useRef<boolean>(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotationSpeedRef = useRef<{ value: number }>({ value: 0.06 });

  useEffect(() => {
    if (controlsRef.current && onControlsReady) {
      onControlsReady(controlsRef.current);
    }
  }, [onControlsReady]);

  // Handle user interaction start / end
  const handleStart = () => {
    isInteractingRef.current = true;
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Instantly pause auto-rotation while user is actively dragging
    gsap.killTweensOf(rotationSpeedRef.current);
    rotationSpeedRef.current.value = 0;
  };

  const handleEnd = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Resume smooth auto-rotation after 3000ms of inactivity ONLY if no location is focused
    inactivityTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      if (!hasSelectedLocation) {
        gsap.to(rotationSpeedRef.current, {
          value: 0.06,
          duration: 1.2,
          ease: 'power3.out',
        });
      }
    }, 3000);
  };

  // Frame loop for auto-rotation: strictly around the true polar Y axis [0, 1, 0]
  useFrame((_, delta) => {
    if (
      !isFlying &&
      !hasSelectedLocation &&
      !isInteractingRef.current &&
      earthGroupRef.current &&
      rotationSpeedRef.current.value > 0
    ) {
      earthGroupRef.current.rotation.y += delta * rotationSpeedRef.current.value;
    }
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      target={[0, 0, 0]}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.08}
      rotateSpeed={0.45}
      zoomSpeed={0.7}
      minDistance={1.6}
      maxDistance={8}
      minPolarAngle={Math.PI * 0.06}
      maxPolarAngle={Math.PI * 0.94}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
};
