import * as THREE from 'three';

export const EARTH_RADIUS = 1.5;
export const EARTH_SEGMENTS = 128;
export const CLOUD_RADIUS = EARTH_RADIUS + 0.008;
export const ATMOSPHERE_SCALE = 1.025;
export const MARKER_OFFSET = 0.02;

/**
 * Converts geographic latitude and longitude (in degrees) into a 3D Cartesian Vector3
 * on a sphere of specified radius.
 */
export function latLngToVector3(
  latitude: number,
  longitude: number,
  radius: number = EARTH_RADIUS
): THREE.Vector3 {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculates the target camera position for a given lat/lng at a specific distance.
 */
export function getCameraDestination(
  latitude: number,
  longitude: number,
  cameraDistance: number = 2.6
): { cameraPosition: THREE.Vector3; targetPosition: THREE.Vector3; surfacePosition: THREE.Vector3 } {
  const surfacePosition = latLngToVector3(latitude, longitude, EARTH_RADIUS);
  const direction = surfacePosition.clone().normalize();
  const cameraPosition = direction.clone().multiplyScalar(cameraDistance);
  const targetPosition = surfacePosition.clone().multiplyScalar(0.92);

  return { cameraPosition, targetPosition, surfacePosition };
}
