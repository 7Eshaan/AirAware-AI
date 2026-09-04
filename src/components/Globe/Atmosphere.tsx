import React, { useMemo } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, ATMOSPHERE_SCALE } from '../../utils/latLngToVector3';

export const Atmosphere: React.FC = () => {
  // Atmosphere custom Fresnel rim shader
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          // Soft Fresnel rim glow around the silhouette of the sphere
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.2, 0.65, 1.0, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh scale={[ATMOSPHERE_SCALE, ATMOSPHERE_SCALE, ATMOSPHERE_SCALE]}>
      <sphereGeometry args={[EARTH_RADIUS * 1.015, 64, 64]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
};
