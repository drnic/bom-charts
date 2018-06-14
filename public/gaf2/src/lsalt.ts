import * as $ from 'jquery';
import * as controller from "./controller";
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as wait from "./helpers/wait";
import { GeoJSONSource } from 'mapbox-gl';

export interface LSALTGrid {
  grid: number[][];
  lsalt_100ft: number;
}

let map = mapui.map;

export function init() {
  setupLayer();

  update();
  wait.runEvery(1000 * 60 * 60, update);
  // wait.runEvery(1000, update);
}

function update() {
  let vfr = controller.vfr;

  $.getJSON(`/lsalt?vfr=${vfr}`, (data) => {
    let source = <GeoJSONSource>map.getSource(`lsalt`);
    source.setData(data);
    console.log("update lsalt")
  });
}

function setupLayer() {
  map.addSource(`lsalt`, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  let vfr = controller.vfr;
  map.addLayer({
    "id": `lsalt`,
    "type": "fill",
    "source": `lsalt`,
    "paint": {
      "fill-color": {
        property: "lsaltColorLevel",
        stops: theme.cssHeightColorsStops,
      },
      "fill-antialias": false,
      "fill-opacity": 0.5
    }
  });
}