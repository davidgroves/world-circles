import "leaflet/dist/leaflet.css";
import "./styles.css";
import { createMap } from "./map";
import { parseUrl, writeUrl, type AppState } from "./state";
import { createUi } from "./ui";

const mapEl = document.querySelector<HTMLElement>("#map");
if (!mapEl) throw new Error("Missing #map");

const state: AppState = parseUrl();

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
    map.setCircles(state.spacing, state.count);
    writeUrl(state);
  },
  (count) => {
    state.count = count;
    map.setCircles(state.spacing, state.count);
    writeUrl(state);
  },
);

ui.sync(state);
writeUrl(state);
