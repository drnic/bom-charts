"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapboxgl = require("mapbox-gl");
const controller = require("./controller");
// mapboxgl.accessToken = 'pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q';
Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q');
function mapStyle() {
    if (controller.vfr == controller.VFR.day) {
        return 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g';
    }
    else {
        return 'mapbox://styles/mapbox/dark-v9';
    }
}
function updateStyle() {
    exports.map.setStyle(mapStyle());
}
exports.updateStyle = updateStyle;
exports.map = new mapboxgl.Map({
    container: 'map',
    style: mapStyle(),
    center: [133.5, -24.25],
    zoom: 2
});
