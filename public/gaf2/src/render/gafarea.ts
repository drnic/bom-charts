import * as mapboxgl from "mapbox-gl";
import * as gafarea from "../data/gafarea";
import * as wait from "../helpers/wait";

var map: mapboxgl.Map;

export function init(_map: mapboxgl.Map) {
  map = _map;
}

export function setupGAFBoundary(areaCode: string, boundary: gafarea.Boundary) {
  wait.delay(100).then(() => {
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
  })
}

