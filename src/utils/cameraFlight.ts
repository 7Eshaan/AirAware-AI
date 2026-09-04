import * as THREE from 'three';
import gsap from 'gsap';
import { EARTH_RADIUS, latLngToVector3 } from './latLngToVector3';

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

  // Calculate surface position and normal direction
  const surfacePosition = latLngToVector3(latitude, longitude, EARTH_RADIUS);
  const direction = surfacePosition.clone().normalize();
  const cameraDestination = direction.clone().multiplyScalar(cameraDistance);
  const targetDestination = surfacePosition.clone().multiplyScalar(0.92);

  // If Earth group exists, calculate the angular alignment
  // so the searched location smoothly faces toward the front (+Z / camera arc)
  let targetEarthRotationY = earthGroup ? earthGroup.rotation.y : 0;
  if (earthGroup) {
    // Determine the longitude rotation offset
    const targetLonRad = (longitude * Math.PI) / 180;
    // Align with front view
    targetEarthRotationY = -targetLonRad + Math.PI / 2;
  }

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

  // Phase A — Slow Existing Motion & Start Alignment (0.4s, power2.out)
  timeline.to(
    camera.position,
    {
      x: camera.position.x * 1.05,
      y: camera.position.y * 1.05,
      z: camera.position.z * 1.05,
      duration: 0.4,
      ease: 'power2.out',
    },
    0
  );

  // Phase B — Rotate Earth & Fly Camera (2.2s, power3.inOut)
  if (earthGroup) {
    timeline.to(
      earthGroup.rotation,
      {
        y: targetEarthRotationY,
        duration: 2.2,
        ease: 'power3.inOut',
      },
      0.4
    );
  }

  timeline.to(
    camera.position,
    {
      x: cameraDestination.x,
      y: cameraDestination.y,
      z: cameraDestination.z,
      duration: 2.2,
      ease: 'power3.inOut',
    },
    0.4
  );

  timeline.to(
    controls.target,
    {
      x: targetDestination.x,
      y: targetDestination.y,
      z: targetDestination.z,
      duration: 2.2,
      ease: 'power3.inOut',
    },
    0.4
  );

  // Reveal marker at ~80% flight completion (at ~2.24s mark)
  if (onMarkerReveal) {
    timeline.call(onMarkerReveal, undefined, 2.2);
  }

  // Phase C — Final Settle (0.4s, power2.out)
  timeline.to(
    camera.position,
    {
      x: cameraDestination.x,
      y: cameraDestination.y,
      z: cameraDestination.z,
      duration: 0.4,
      ease: 'power2.out',
    },
    2.4
  );

  return timeline;
}
