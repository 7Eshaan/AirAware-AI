import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EARTH_RADIUS, MARKER_OFFSET, latLngToVector3 } from '../../utils/latLngToVector3';

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  locationName: string;
  aqi?: number;
  visible?: boolean;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({
  latitude,
  longitude,
  locationName,
  aqi,
  visible = true,
}) => {
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Position offset from earth surface
  const surfacePos = latLngToVector3(latitude, longitude, EARTH_RADIUS);
  const direction = surfacePos.clone().normalize();
  const markerPos = direction.clone().multiplyScalar(EARTH_RADIUS + MARKER_OFFSET);

  // Orientation to align flat against Earth's curved surface
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

  useFrame((state) => {
    if (!visible) return;
    const time = state.clock.getElapsedTime();
    // Pulse animation from 1.0 to 1.8 scale with opacity fading
    const progress = (time % 1.5) / 1.5;
    const scale = 1.0 + progress * 0.8;
    const opacity = 0.8 * (1.0 - progress);

    if (pulseRingRef.current) {
      pulseRingRef.current.scale.set(scale, scale, scale);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = opacity;
    }
  });

  if (!visible) return null;

  return (
    <group position={markerPos} quaternion={quaternion}>
      {/* Expanding Pulse Ring */}
      <mesh ref={pulseRingRef}>
        <ringGeometry args={[0.025, 0.038, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Solid Inner Glowing Dot */}
      <mesh ref={coreRef}>
        <circleGeometry args={[0.016, 32]} />
        <meshBasicMaterial
          color="#34d399"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Sleek Billboard City Name Label */}
      <Html
        position={[0, 0.04, 0]}
        center
        distanceFactor={5}
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex flex-col items-center animate-in fade-in duration-300">
          <div className="px-2 py-0.5 rounded-full bg-slate-950/95 text-white text-[10px] font-bold tracking-wide border border-emerald-500/60 shadow-xl shadow-emerald-950/90 backdrop-blur-md whitespace-nowrap flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{locationName}</span>
            {aqi !== undefined && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold">
                AQI {aqi}
              </span>
            )}
          </div>
          <div className="w-1 h-1 bg-emerald-500 transform rotate-45 -mt-0.5 shadow-sm" />
        </div>
      </Html>
    </group>
  );
};
