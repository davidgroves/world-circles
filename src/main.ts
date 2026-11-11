import "leaflet/dist/leaflet.css";
import "./styles.css";
import { createMap } from "./map";
import { parseUrl, writeUrl, type AppState } from "./state";
import { createUi } from "./ui";

const mapEl = document.querySelector<HTMLElement>("#map");
if (!mapEl) throw new Error("Missing #map");

const state: AppState = parseUrl();

function redrawFromState(): void {
  map.setCircles({
    spacing: state.spacing,
    count: state.count,
    steps: state.steps,
    wgs84: state.wgs84,
  });
  writeUrl(state);
}

const map = createMap(
  mapEl,
  state,
  (lat, lng) => {
    state.centre = { lat, lng };
    map.setCentre(state.centre);
    writeUrl(state);
  },
  (view) => {
    state.view = { lat: view.lat, lng: view.lng };
    state.zoom = view.zoom;
    writeUrl(state);
  },
);

const ui = createUi(
  (spacing) => {
    state.spacing = spacing;
    redrawFromState();
  },
  (count) => {
    state.count = count;
    redrawFromState();
  },
  (steps) => {
    state.steps = steps;
    redrawFromState();
  },
  (wgs84) => {
    state.wgs84 = wgs84;
    redrawFromState();
  },
);

ui.sync(state);
writeUrl(state);
