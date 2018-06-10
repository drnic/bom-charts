import * as mapboxgl from "mapbox-gl";
import * as gafarea from "../data/gafarea";
import * as wait from "../helpers/wait";

var map: mapboxgl.Map;

export function init(_map: mapboxgl.Map) {
  map = _map;
}

export function setupGAFBoundary(areaCode: string, boundary: gafarea.Boundary) {
  wait.delay(100).then(() => {
    let layerID = `gaf-${areaCode}`;
    if (map.getLayer(layerID)) {
      map.removeLayer(layerID);
      map.removeSource(layerID);
    }

    map.addSource(layerID, {
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
      "id": layerID,
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

