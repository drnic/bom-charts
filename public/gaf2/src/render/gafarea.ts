import * as theme from "../theme";
import * as mapui from "../mapui";
import * as gafarea from "../data/gafarea";
import * as wait from "../helpers/wait";

export function setupGAFBoundary(areaCode: string, boundary: gafarea.Boundary) {
  let map = mapui.map;

  wait.until(() => map.isStyleLoaded, () => {
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
        "line-width": 0,
      }
    });
  })
}

