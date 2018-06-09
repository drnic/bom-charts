import * as mapboxgl from "mapbox-gl";
import * as gafarea from "../data/gafarea";

var map: mapboxgl.Map;

export function init(_map: mapboxgl.Map) {
  map = _map;
}

export function setupGAFBoundary(areaCode: string, boundary: gafarea.Boundary) {
  if (!map.isStyleLoaded()) {
    console.log(`Cannot setupGAFBoundary(${areaCode}) - style not loaded yet`);
    return;
  }
  map.addSource(`gaf-${areaCode}`, {
    "type": "geojson",
    "data": {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": boundary.points
      }
    }
  });

  map.addLayer({
    "id": `gaf-${areaCode}`,
    "type": "line",
    "source": "gaf-" + areaCode,
    "layout": {
      "line-join": "round", "line-cap": "round"
    },
    "paint": {
      "line-width": 1
    }
  });
}

