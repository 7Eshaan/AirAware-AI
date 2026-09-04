import * as THREE from 'three';
import gsap from 'gsap';

export interface CameraFlightOptions {
  camera: THREE.Camera;
  controls: any; // OrbitControls
  earthGroup?: THREE.Group | null;
  latitude: number;
  longitude: number;
  cameraDistance?: number;
  onMarkerReveal?: () => void;
  onComplete?: () => void;
}

let activeTimeline: gsap.core.Timeline | null = null;

/**
 * Executes a cinematic 2.8s multi-phase camera flight to the destination coordinate.
 * Prevents wrong-side view by smoothly adjusting Earth rotation if needed.
 */
export function flyCameraToLocation({
  camera,
  controls,
  earthGroup,
  latitude,
  longitude,
  cameraDistance = 2.6,
  onMarkerReveal,
  onComplete,
}: CameraFlightOptions) {
  // Kill any existing flight animation
  if (activeTimeline) {
    activeTimeline.kill();
  }

  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  // The angle around Y that aligns this longitude with front facing (+Z):
  // R_y = -lonRad - Math.PI / 2
  const targetY = -lonRad - Math.PI / 2;

  // Calculate shortest angular rotation from current Y to target Y to avoid spinning 360+ degrees
  const currentY = earthGroup ? earthGroup.rotation.y : 0;
  let diff = (targetY - currentY) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  const finalEarthRotationY = currentY + diff;

  // Camera destination positioned directly in front of the target coordinate on the Y-Z plane
  // Looking directly through the location toward (0, 0, 0)
  const cameraDestination = new THREE.Vector3(
    0,
    cameraDistance * Math.sin(latRad),
    cameraDistance * Math.cos(latRad)
  );

  const timeline = gsap.timeline({
    onUpdate: () => {
      if (controls && controls.update) {
        controls.update();
      }
    },
    onComplete: () => {
      activeTimeline = null;
      if (onComplete) onComplete();
    },
  });

  activeTimeline = timeline;

  // Always keep OrbitControls target locked at the center of the Earth (0, 0, 0)
  // This prevents any off-center tumbling or bizarre rotation axis wobbles
  if (controls && controls.target) {
    timeline.to(
      controls.target,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: 'power2.out',
      },
      0
    );
  }

  // Phase A — Slight pullback for cinematic feel (0.3s)
  timeline.to(
    camera.position,
    {
      x: camera.position.x * 1.04,
      y: camera.position.y * 1.04,
      z: camera.position.z * 1.04,
      duration: 0.3,
      ease: 'power2.out',
    },
    0
  );

  // Phase B — Align Earth rotation on true polar Y axis & Fly camera to destination (2.0s)
  if (earthGroup) {
    timeline.to(
      earthGroup.rotation,
      {
        y: finalEarthRotationY,
        duration: 2.0,
        ease: 'power3.inOut',
      },
      0.3
    );
  }

  timeline.to(
    camera.position,
    {
      x: cameraDestination.x,
      y: cameraDestination.y,
      z: cameraDestination.z,
      duration: 2.0,
      ease: 'power3.inOut',
    },
    0.3
  );

  // Reveal marker at ~80% flight completion
  if (onMarkerReveal) {
    timeline.call(onMarkerReveal, undefined, 1.9);
  }

  // Phase C — Final settle (0.3s)
  timeline.to(
    camera.position,
    {
      x: cameraDestination.x,
      y: cameraDestination.y,
      z: cameraDestination.z,
      duration: 0.3,
      ease: 'power2.out',
    },
    2.3
  );

  return timeline;
}
