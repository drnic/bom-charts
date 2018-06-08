"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mapboxgl = require("mapbox-gl");
var menu = require("./menu");
// mapboxgl.accessToken = 'pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q';
Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q');
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g',
    center: [133.5, -24.25],
    zoom: 2
});
menu.init(map);
