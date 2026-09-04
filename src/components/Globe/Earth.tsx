import React, { Suspense, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_RADIUS, EARTH_SEGMENTS } from '../../utils/latLngToVector3';
import { createProceduralEarthTexture } from '../../utils/textureFallback';

// GLB model scale: GLB radius is 500 units, target radius is 1.5 units
const GLB_SCALE = 1.5 / 500; // 0.003
// Align GLB prime meridian with Three.js coordinate space (90 degrees rotation around Y)
const GLB_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0];

interface EarthProps {
  customTexture?: THREE.Texture | null;
}

const EarthGLB: React.FC = () => {
  const { scene } = useGLTF('/models/Earth_1_12756.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={GLB_SCALE}
      rotation={GLB_ROTATION}
    />
  );
};

const EarthProcedural: React.FC = () => {
  const earthTexture = React.useMemo(() => createProceduralEarthTexture(), []);

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
      <meshStandardMaterial
        map={earthTexture}
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  );
};

export const Earth: React.FC<EarthProps> = () => {
  return (
    <Suspense fallback={<EarthProcedural />}>
      <EarthGLB />
    </Suspense>
  );
};

// Preload the GLB 3D Earth model for instantaneous rendering
useGLTF.preload('/models/Earth_1_12756.glb');

