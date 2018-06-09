"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mapboxgl = require("mapbox-gl");
var controller = require("./controller");
var menu = require("./menu");
var airports = require("./airports");
var gafarearender = require("./render/gafarea");
// mapboxgl.accessToken = 'pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q';
Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q');
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g',
    center: [133.5, -24.25],
    zoom: 2
});
gafarearender.init(map);
menu.init(map);
airports.init(map);
controller.init(map);
