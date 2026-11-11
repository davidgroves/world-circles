import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { geodesicRing, ringSpansAntimeridian } from "./geodesicRing";
import type { AppState } from "./state";

// Vite-friendly default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export type MapController = {
  setCentre: (centre: { lat: number; lng: number } | null) => void;
  setCircles: (spacing: number, count: number, steps: number) => void;
  getView: () => { lat: number; lng: number; zoom: number };
};

export function createMap(
  container: HTMLElement,
  initial: AppState,
  onCentreClick: (lat: number, lng: number) => void,
  onViewChange: (view: { lat: number; lng: number; zoom: number }) => void,
): MapController {
  const map = L.map(container, {
    center: [initial.view.lat, initial.view.lng],
    zoom: initial.zoom,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  const circles = L.layerGroup().addTo(map);
  let marker: L.Marker | null = null;
  let centre: { lat: number; lng: number } | null = initial.centre;
  let spacing = initial.spacing;
  let count = initial.count;
  let steps = initial.steps;
  let suppressViewEvent = false;

  function redrawCircles(): void {
    circles.clearLayers();
    if (!centre) return;

    for (let i = 1; i <= count; i++) {
      const ring = geodesicRing(centre.lat, centre.lng, spacing * i, steps);
      const crossesAntimeridian = ringSpansAntimeridian(ring);

      L.polygon(ring, {
        color: "#1a5f7a",
        weight: 2,
        opacity: 0.85,
        fillColor: "#1a5f7a",
        fillOpacity: crossesAntimeridian ? 0 : 0.04,
      }).addTo(circles);
    }
  }

  function setCentre(next: { lat: number; lng: number } | null): void {
    centre = next;
    if (marker) {
      marker.remove();
      marker = null;
    }
    if (centre) {
      marker = L.marker([centre.lat, centre.lng]).addTo(map);
    }
    redrawCircles();
  }

  function setCircles(
    nextSpacing: number,
    nextCount: number,
    nextSteps: number,
  ): void {
    spacing = nextSpacing;
    count = nextCount;
    steps = nextSteps;
    redrawCircles();
  }

  map.on("click", (e: L.LeafletMouseEvent) => {
    onCentreClick(e.latlng.lat, e.latlng.lng);
  });

  map.on("moveend", () => {
    if (suppressViewEvent) return;
    const c = map.getCenter();
    onViewChange({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
  });

  map.on("zoomend", () => {
    if (suppressViewEvent) return;
    const c = map.getCenter();
    onViewChange({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
  });

  if (initial.centre) {
    setCentre(initial.centre);
  }

  // Ensure tiles layout correctly after mount
  requestAnimationFrame(() => {
    suppressViewEvent = true;
    map.invalidateSize();
    suppressViewEvent = false;
  });

  return {
    setCentre,
    setCircles,
    getView: () => {
      const c = map.getCenter();
      return { lat: c.lat, lng: c.lng, zoom: map.getZoom() };
    },
  };
}
