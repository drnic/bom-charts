"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const theme = require("../theme");
const mapui = require("../mapui");
const wait = require("../helpers/wait");
function setupGAFBoundary(areaCode, boundary) {
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
                "line-width": 1,
                "line-color": theme.current().lineColor,
            }
        });
    });
}
exports.setupGAFBoundary = setupGAFBoundary;
