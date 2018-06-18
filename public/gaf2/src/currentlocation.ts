import * as controller from './controller';
import * as mapui from "./mapui";

import { Marker } from 'mapbox-gl';

let marker: Marker;

/**
 *  TODO: replace with https://www.mapbox.com/mapbox-gl-js/api/#geolocatecontrol
 */
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