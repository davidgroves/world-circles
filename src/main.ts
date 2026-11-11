import "leaflet/dist/leaflet.css";
import "./styles.css";
import { createMap } from "./map";
import { parseUrl, writeUrl, type AppState } from "./state";
import { createUi } from "./ui";

const mapEl = document.querySelector<HTMLElement>("#map");
if (!mapEl) throw new Error("Missing #map");

const state: AppState = parseUrl();

function redrawFromState(): void {
  map.setCircles(state.spacing, state.count, state.steps);
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
);

ui.sync(state);
writeUrl(state);
