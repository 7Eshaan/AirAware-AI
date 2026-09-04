import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';

interface GlobeControlsProps {
  earthGroupRef: React.RefObject<THREE.Group | null>;
  isFlying?: boolean;
  onControlsReady?: (controls: OrbitControlsImpl) => void;
}

export const GlobeControls: React.FC<GlobeControlsProps> = ({
  earthGroupRef,
  isFlying = false,
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
    // Instantly pause auto-rotation
    gsap.killTweensOf(rotationSpeedRef.current);
    rotationSpeedRef.current.value = 0;
  };

  const handleEnd = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Resume auto-rotation after 3000ms of inactivity over 1.2s with easeOutCubic
    inactivityTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      gsap.to(rotationSpeedRef.current, {
        value: 0.06,
        duration: 1.2,
        ease: 'power3.out',
      });
    }, 3000);
  };

  // Frame loop for auto-rotation
  useFrame((_, delta) => {
    if (!isFlying && earthGroupRef.current && rotationSpeedRef.current.value > 0) {
      earthGroupRef.current.rotation.y += delta * rotationSpeedRef.current.value;
    }
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.08}
      rotateSpeed={0.45}
      zoomSpeed={0.7}
      minDistance={1.6}
      maxDistance={8}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
};
