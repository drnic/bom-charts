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

let sourceID = `lsalt`;

export function init() {
  update();
  wait.runEvery(1000 * 60 * 60, update);
  // wait.runEvery(1000, update);
}

function update() {
  let map = mapui.map;
  let vfr = controller.vfr;

  $.getJSON(`/lsalt?vfr=${vfr}`, (data) => {
    let source = <GeoJSONSource>map.getSource(sourceID);
    if (source === undefined) {
      setupLayer();
      source = <GeoJSONSource>map.getSource(sourceID);
    }
    source.setData(data);
    console.log(`update ${sourceID} - ${data.features.length} features, example:`);
    console.log(data.features[0]);
  });
}

function setupLayer() {
  let map = mapui.map;
  map.addSource(sourceID, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addLayer({
    "id": `lsalt`,
    "type": "fill",
    "source": sourceID,
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