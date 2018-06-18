import * as controller from './controller';
import * as mapui from "./mapui";

import { Marker } from 'mapbox-gl';

let marker: Marker;

export function update() {
  if (marker === undefined) {
    setupMarker();
  }
  marker.setLngLat(controller.currentLocation);
}

function setupMarker() {
  marker = new Marker()
  .setLngLat(controller.currentLocation)
  .addTo(mapui.map);
}