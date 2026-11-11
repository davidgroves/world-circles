import type { LatLngExpression } from "leaflet";
import { Geodesic } from "geographiclib-geodesic";

const geod = Geodesic.WGS84;

/**
 * Sample a WGS84 geodesic circle as a closed ring of lat/lng points.
 */
export function geodesicRing(
  lat: number,
  lng: number,
  radiusMetres: number,
  steps: number,
): LatLngExpression[] {
  const points: LatLngExpression[] = [];

  for (let i = 0; i < steps; i++) {
    const azi = (360 * i) / steps;
    const r = geod.Direct(lat, lng, azi, radiusMetres);
    points.push([r.lat2!, r.lon2!]);
  }

  // Close the ring for polygon fill
  points.push(points[0]!);
  return points;
}

/** True when the ring likely crosses the antimeridian (fill can look wrong). */
export function ringSpansAntimeridian(points: LatLngExpression[]): boolean {
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const p of points) {
    const lon = Array.isArray(p) ? Number(p[1]) : (p as { lng: number }).lng;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  return maxLon - minLon > 180;
}
