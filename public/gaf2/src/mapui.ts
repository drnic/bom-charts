import * as mapboxgl from "mapbox-gl";
import * as controller from './controller';

// mapboxgl.accessToken = 'pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q';
Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q');

function mapStyle() {
  if (controller.vfr == controller.VFR.day) {
    return 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g';
  } else {
    return 'mapbox://styles/mapbox/dark-v9';
  }
}

export function updateStyle() {
  map.setStyle(mapStyle());
}

export var map = new mapboxgl.Map({
  container: 'map',
  style: mapStyle(), // changes via menu.js if night vfr
  center: [133.5,-24.25],
  zoom: 2
});
