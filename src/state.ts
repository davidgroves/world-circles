export type AppState = {
  /** Circle centre; null until the user clicks. */
  centre: { lat: number; lng: number } | null;
  /** Map viewport centre. */
  view: { lat: number; lng: number };
  zoom: number;
  /** Ring spacing in metres. */
  spacing: number;
  /** Number of concentric rings. */
  count: number;
};

export const DEFAULTS: AppState = {
  centre: null,
  view: { lat: 54.5, lng: -2.5 },
  zoom: 6,
  spacing: 1000,
  count: 5,
};

const SPACING_MIN = 100;
const SPACING_MAX = 50_000;
const COUNT_MIN = 1;
const COUNT_MAX = 20;
const ZOOM_MIN = 1;
const ZOOM_MAX = 19;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseNumber(value: string | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatSpacing(metres: number): string {
  if (metres >= 1000) {
    const km = metres / 1000;
    return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
  }
  return `${metres} m`;
}

export function parseUrl(search = window.location.search): AppState {
  const params = new URLSearchParams(search);
  const state: AppState = { ...DEFAULTS, view: { ...DEFAULTS.view } };

  const lat = parseNumber(params.get("lat"));
  const lng = parseNumber(params.get("lng"));
  if (lat !== null && lng !== null) {
    state.centre = {
      lat: clamp(lat, -90, 90),
      lng: clamp(lng, -180, 180),
    };
  }

  const vlat = parseNumber(params.get("vlat"));
  const vlng = parseNumber(params.get("vlng"));
  if (vlat !== null && vlng !== null) {
    state.view = {
      lat: clamp(vlat, -90, 90),
      lng: clamp(vlng, -180, 180),
    };
  } else if (state.centre) {
    state.view = { ...state.centre };
  }

  const z = parseNumber(params.get("z"));
  if (z !== null) state.zoom = clamp(Math.round(z), ZOOM_MIN, ZOOM_MAX);

  const spacing = parseNumber(params.get("spacing"));
  if (spacing !== null) {
    state.spacing = clamp(Math.round(spacing / 100) * 100, SPACING_MIN, SPACING_MAX);
  }

  const count = parseNumber(params.get("count"));
  if (count !== null) {
    state.count = clamp(Math.round(count), COUNT_MIN, COUNT_MAX);
  }

  return state;
}

export function writeUrl(state: AppState): void {
  const params = new URLSearchParams();
  params.set("vlat", state.view.lat.toFixed(6));
  params.set("vlng", state.view.lng.toFixed(6));
  params.set("z", String(state.zoom));
  params.set("spacing", String(state.spacing));
  params.set("count", String(state.count));

  if (state.centre) {
    params.set("lat", state.centre.lat.toFixed(6));
    params.set("lng", state.centre.lng.toFixed(6));
  }

  const next = `${window.location.pathname}?${params.toString()}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (next !== current) {
    history.replaceState(null, "", next);
  }
}
