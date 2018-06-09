import * as mapboxgl from "mapbox-gl";
import * as controller from './controller';
import * as menu from "./menu";
import * as airports from "./airports";
import * as gafarearender from "./render/gafarea";

// mapboxgl.accessToken = 'pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q';
Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1IjoiZHJuaWMiLCJhIjoiY2poaWRidWpyMG02dzM3bXBtMmtiMWdjaiJ9.MowHdxFXszibdQ48A255-Q');

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g', // changes via menu.js if night vfr
  center: [133.5,-24.25],
  zoom: 2
});

gafarearender.init(map);
menu.init(map);
airports.init(map);
controller.init(map);