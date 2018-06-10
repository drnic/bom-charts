import * as wait from "../helpers/wait";
var map;
export function init(_map) {
    map = _map;
}
export function setupGAFBoundary(areaCode, boundary) {
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
    });
}
