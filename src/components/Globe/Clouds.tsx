import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CLOUD_RADIUS } from '../../utils/latLngToVector3';
import { createProceduralCloudsTexture } from '../../utils/textureFallback';

interface CloudsProps {
  isFlying?: boolean;
}

export const Clouds: React.FC<CloudsProps> = ({ isFlying = false }) => {
  const cloudsRef = useRef<THREE.Mesh>(null);

  const cloudTexture = useMemo(() => {
    return createProceduralCloudsTexture();
  }, []);

  useFrame((_, delta) => {
    if (cloudsRef.current && !isFlying) {
      // Independent cloud rotation slightly faster than Earth (0.075 rad/s)
      cloudsRef.current.rotation.y += delta * 0.075;
    }
  });

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[CLOUD_RADIUS, 128, 128]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent={true}
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        roughness={1}
      />
    </mesh>
  );
};
