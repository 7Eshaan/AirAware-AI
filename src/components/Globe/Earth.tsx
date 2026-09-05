import React, { Suspense, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// GLB model scale: GLB radius is 500 units, target radius is 1.5 units
const GLB_SCALE = 1.5 / 500; // 0.003
// Align GLB prime meridian with Three.js coordinate space (90 degrees rotation around Y)
const GLB_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0];

interface EarthProps {
  customTexture?: THREE.Texture | null;
  onLoaded?: () => void;
}

const EarthGLB: React.FC<{ onLoaded?: () => void }> = ({ onLoaded }) => {
  const { scene } = useGLTF('/models/Earth_1_12756.glb');
  const frameCount = useRef(0);
  const notifiedRef = useRef(false);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Wait until WebGL has rendered multiple frames with the real GLB model
  useFrame(() => {
    if (!notifiedRef.current) {
      frameCount.current += 1;
      // After at least 4 frames of actual GPU WebGL rendering
      if (frameCount.current >= 4) {
        notifiedRef.current = true;
        onLoaded?.();
      }
    }
  });

  return (
    <primitive
      object={scene}
      scale={GLB_SCALE}
      rotation={GLB_ROTATION}
    />
  );
};

export const Earth: React.FC<EarthProps> = ({ onLoaded }) => {
  return (
    <Suspense fallback={null}>
      <EarthGLB onLoaded={onLoaded} />
    </Suspense>
  );
};

// Preload the GLB 3D Earth model for instantaneous rendering
useGLTF.preload('/models/Earth_1_12756.glb');

