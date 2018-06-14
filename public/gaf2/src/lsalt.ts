import * as $ from 'jquery';
import * as controller from "./controller";
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as gafarea from "./data/gafarea";
import * as maparea from "./data/maparea";
import * as random from "./helpers/random";
import * as wait from "./helpers/wait";
import * as turf from "@turf/helpers";
import * as turfintersect from "@turf/intersect";
import { GeoJSONSource } from 'mapbox-gl';

export interface LSALTGrid {
  grid: number[][];
  lsalt_100ft: number;
}

let map = mapui.map;

export function init() {
  update();
  wait.runEvery(1000 * 60 * 60, update);
  // wait.runEvery(1000, update);
}

function update() {
  let vfr = controller.vfr;
  let url = `/lsalt?vfr=${vfr}`;

  setupLayer();

  $.getJSON(`/lsalt?vfr=${vfr}`, (data) => {
    let sourceID = `lsalt-${vfr}`;
    let source = <GeoJSONSource>map.getSource(sourceID);
    source.setData(data);
    console.log("update lsalt")
  });
}

function setupLayer() {
  map.addSource(`lsalt-day`, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addSource(`lsalt-night`, {
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
    "source": `lsalt-${vfr}`,
    "paint": {
      "fill-color": {
        property: "lsalt_color_level",
        stops: theme.cssHeightColorsStops,
      },
      "fill-antialias": false,
      "fill-opacity": 0.5
    }
  });
}