"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var map;
function init(_map) {
    map = _map;
}
exports.init = init;
function setupGAFBoundary(areaCode, boundary) {
    if (!map.isStyleLoaded()) {
        console.log("Cannot setupGAFBoundary(" + areaCode + ") - style not loaded yet");
        return;
    }
    map.addSource("gaf-" + areaCode, {
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
        "id": "gaf-" + areaCode,
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
exports.setupGAFBoundary = setupGAFBoundary;
