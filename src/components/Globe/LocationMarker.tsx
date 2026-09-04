import React, { useRef, useMemo } from 'react';
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
  const markerGroupRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const targetRingRef = useRef<THREE.Mesh>(null);
  const coreDotRef = useRef<THREE.Mesh>(null);
  const stemRef = useRef<THREE.Mesh>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);

  // Position offset from earth surface
  const surfacePos = useMemo(
    () => latLngToVector3(latitude, longitude, EARTH_RADIUS),
    [latitude, longitude]
  );
  const direction = useMemo(() => surfacePos.clone().normalize(), [surfacePos]);
  const markerPos = useMemo(
    () => direction.clone().multiplyScalar(EARTH_RADIUS + MARKER_OFFSET),
    [direction]
  );

  // Orientation to align perpendicular against Earth's curved surface
  // Local +Z points directly radially outward into space
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    return q;
  }, [direction]);

  const stemHeight = 0.055;

  useFrame((state) => {
    if (!visible || !markerGroupRef.current) return;

    // 1. Radar pulse ripple on ground
    const time = state.clock.getElapsedTime();
    const progress = (time % 1.6) / 1.6;
    const pulseProgress = 1.0 + progress * 1.6;
    const pulseOpacity = 0.75 * (1.0 - progress);

    // 2. Camera distance & Zoom factor
    const worldPos = new THREE.Vector3();
    markerGroupRef.current.getWorldPosition(worldPos);
    const dist = state.camera.position.distanceTo(worldPos);

    // Zoom dynamic scale:
    // When zooming in close (dist ~ 1.5): zoomFactor ~ 1.55 (enlarges)
    // When zooming far out (dist ~ 6.0): zoomFactor ~ 0.50 (shrinks)
    const zoomFactor = Math.pow(2.6 / Math.max(dist, 1.2), 0.85);

    // 3. 3D Rotation & Orientation factor:
    // normal = surface normal in world space
    // toCamera = direction from marker toward camera
    const normal = worldPos.clone().normalize();
    const toCamera = state.camera.position.clone().sub(worldPos).normalize();
    const dot = normal.dot(toCamera);

    // As Earth rotates and marker angles away toward the limb, orientationFactor shrinks
    const clampedDot = THREE.MathUtils.clamp(dot, 0, 1);
    const orientationFactor = Math.pow(clampedDot, 0.55);

    // Combined dynamic scale responding continuously to zoom AND 3D rotation/orientation:
    const dynamicScale = THREE.MathUtils.clamp(
      zoomFactor * orientationFactor,
      0.25,
      1.55
    );

    // 4. Horizon occlusion / Backface culling:
    // Smoothly fade out as marker approaches Earth's limb and turns to the dark side
    const horizonFade = THREE.MathUtils.clamp((dot - 0.04) / 0.16, 0, 1);

    if (pulseRingRef.current) {
      pulseRingRef.current.scale.set(pulseProgress * dynamicScale, pulseProgress * dynamicScale, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = pulseOpacity * horizonFade;
    }

    if (targetRingRef.current) {
      targetRingRef.current.scale.set(dynamicScale, dynamicScale, 1);
      const mat = targetRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.4 * horizonFade;
    }

    if (coreDotRef.current) {
      coreDotRef.current.scale.set(dynamicScale, dynamicScale, 1);
      const mat = coreDotRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.95 * horizonFade;
    }

    if (stemRef.current) {
      stemRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);
      const mat = stemRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.75 * horizonFade;
    }

    if (labelContainerRef.current) {
      labelContainerRef.current.style.transform = `scale(${dynamicScale}) translateY(-50%)`;
      labelContainerRef.current.style.opacity = `${horizonFade}`;
      labelContainerRef.current.style.pointerEvents = horizonFade > 0.5 ? 'auto' : 'none';
    }
  });

  if (!visible) return null;

  return (
    <group ref={markerGroupRef} position={markerPos} quaternion={quaternion}>
      {/* 1. Ground Surface Radar Pulse (Green) */}
      <mesh ref={pulseRingRef}>
        <ringGeometry args={[0.014, 0.024, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Concentric Fine Target Coordinate Ring (Green) */}
      <mesh ref={targetRingRef}>
        <ringGeometry args={[0.028, 0.031, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Solid Glowing Ground Anchor Dot (Bright Mint Green) */}
      <mesh ref={coreDotRef}>
        <circleGeometry args={[0.01, 32]} />
        <meshBasicMaterial
          color="#34d399"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Vertical Glowing Laser Pinpoint Stem (Emerald Green) */}
      <mesh
        ref={stemRef}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, stemHeight / 2]}
      >
        <cylinderGeometry args={[0.0012, 0.0012, stemHeight, 8]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Sleek Precision Floating HUD Chip (Green Theme) */}
      <Html
        position={[0, 0, stemHeight]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={labelContainerRef}
          className="flex flex-col items-center select-none origin-bottom transition-transform duration-75 ease-out"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Main Floating Glassmorphic Pill */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-2xl backdrop-blur-md transition-colors whitespace-nowrap"
            style={{
              backgroundColor: 'rgba(3, 18, 12, 0.92)',
              borderColor: 'rgba(52, 211, 153, 0.45)',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.85), 0 0 16px -2px rgba(16, 185, 129, 0.5)',
            }}
          >
            {/* Live Indicator Beacon with Soft Ping */}
            <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </div>

            {/* City / Location Name */}
            <span className="text-xs font-semibold tracking-tight text-white/95 drop-shadow-sm">
              {locationName}
            </span>

            {/* Dynamic AQI Micro Badge (Green Theme) */}
            {aqi !== undefined && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider border shadow-sm shrink-0 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                AQI {aqi}
              </span>
            )}
          </div>

          {/* Precision Downward Caret */}
          <div
            className="w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] -mt-[1px]"
            style={{
              borderTopColor: 'rgba(3, 18, 12, 0.92)',
            }}
          />
        </div>
      </Html>
    </group>
  );
};
