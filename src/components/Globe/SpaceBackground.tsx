import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

/**
 * Procedurally generates a soft circular luminous glow texture
 * for organic cosmic dust and nebula gas clouds.
 */
function createNebulaParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  gradient.addColorStop(0.2, 'rgba(170, 195, 245, 0.18)');
  gradient.addColorStop(0.45, 'rgba(100, 120, 210, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Renders an authentic, subtle Milky Way galactic dust lane.
 * Particles are distributed along an inclined celestial plane with natural clustering.
 */
const MilkyWayBand: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createNebulaParticleTexture(), []);

  const { positions, colors, sizes } = useMemo(() => {
    const random = createPRNG(1337);
    const particleCount = 1400;
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);

    // Galactic palette: deep midnight blues, soft astral cyan, ethereal violet, warm stellar gold
    const colorPalette = [
      new THREE.Color('#38bdf8'), // Stellar Cyan
      new THREE.Color('#818cf8'), // Periwinkle / Blue Giant
      new THREE.Color('#a855f7'), // Cosmic Violet
      new THREE.Color('#c084fc'), // Soft Lavender
      new THREE.Color('#fef08a'), // Warm Stellar Amber
      new THREE.Color('#ffffff'), // Diamond White
      new THREE.Color('#6366f1'), // Deep Indigo
    ];

    // Milky way galactic plane tilt: ~35 degrees around X, ~20 degrees around Z
    const planeRotationX = 0.62;
    const planeRotationZ = 0.38;

    for (let i = 0; i < particleCount; i++) {
      // Angle along the galactic ring
      const angle = random() * Math.PI * 2;
      // Distance from origin: between 140 and 220
      const radius = 140 + random() * 80;

      // Concentration along the galactic equator with Gaussian thickness falloff
      const u1 = random();
      const u2 = random();
      const zOffset = (Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2)) * 14;

      // Base coordinates on horizontal plane
      const lx = Math.cos(angle) * radius;
      const ly = zOffset;
      const lz = Math.sin(angle) * radius;

      // Rotate into inclined galactic plane
      // 1. Rotate around X
      const y1 = ly * Math.cos(planeRotationX) - lz * Math.sin(planeRotationX);
      const z1 = ly * Math.sin(planeRotationX) + lz * Math.cos(planeRotationX);
      // 2. Rotate around Z
      const x2 = lx * Math.cos(planeRotationZ) - y1 * Math.sin(planeRotationZ);
      const y2 = lx * Math.sin(planeRotationZ) + y1 * Math.cos(planeRotationZ);

      pos[i * 3] = x2;
      pos[i * 3 + 1] = y2;
      pos[i * 3 + 2] = z1;

      // Pick color with slight clustering
      const c = colorPalette[Math.floor(random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      // Varied particle sizes: mostly soft background haze, with occasional brighter knots
      sz[i] = random() < 0.15 ? 8.0 + random() * 6.0 : 4.0 + random() * 4.0;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, []);

  // Extremely subtle cosmic drift
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={5.5}
        vertexColors
        map={texture}
        transparent
        opacity={0.09}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Distant Solar Corona & Light Origin Glow
 * Positioned in the direction of the main sun light ([5, 3, 5])
 */
const DistantSunGlow: React.FC = () => {
  const sunPosition = useMemo(() => {
    // Matches directional light vector [5, 3, 5] normalized and pushed out to distance 120
    const dir = new THREE.Vector3(5, 3, 5).normalize();
    return dir.multiplyScalar(110);
  }, []);

  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.12, 'rgba(255, 245, 210, 0.9)');
    grad.addColorStop(0.35, 'rgba(255, 200, 120, 0.35)');
    grad.addColorStop(0.65, 'rgba(180, 140, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group position={sunPosition}>
      {/* Brilliant Core Solar Disc */}
      <sprite scale={[12, 12, 1]}>
        <spriteMaterial
          map={sunTexture}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* Outer Ethereal Solar Corona */}
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial
          map={sunTexture}
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
};

/**
 * Complete Real-Space Environment
 * Integrates:
 * 1. Deep cosmic starfield (12,000 fine stellar pinpricks)
 * 2. Mid-distance stellar canopy (5,500 varied stars)
 * 3. Prominent bright stellar beacons (1,800 saturated points)
 * 4. Ultra-subtle Milky Way galactic dust lane against deep black void
 * 5. Distant Sun light source glow
 */
export const SpaceBackground: React.FC = () => {
  return (
    <group>
      {/* 1. Deep Distant Starfield: 12,000 fine stellar pinpricks */}
      <Stars
        radius={320}
        depth={100}
        count={12000}
        factor={3.4}
        saturation={0.5}
        fade
        speed={0.25}
      />

      {/* 2. Mid-Distance Canopy: 5,500 natural spectral stars */}
      <Stars
        radius={220}
        depth={70}
        count={5500}
        factor={4.8}
        saturation={0.8}
        fade
        speed={0.45}
      />

      {/* 3. Foreground Major Stars: 1,800 crisp, brilliant stellar points */}
      <Stars
        radius={160}
        depth={45}
        count={1800}
        factor={6.2}
        saturation={1.0}
        fade
        speed={0.6}
      />

      {/* 4. Subtle Milky Way Galactic Dust Lane */}
      <MilkyWayBand />

      {/* 5. Distant Sun Glow aligned with directional light */}
      <DistantSunGlow />
    </group>
  );
};
