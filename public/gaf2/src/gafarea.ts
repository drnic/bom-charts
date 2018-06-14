import * as $ from 'jquery';
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as wait from "./helpers/wait";
import { GeoJSONSource } from 'mapbox-gl';

let sourceID = `gafareas`;

export function init() {
  setupLayer();
  update();
  wait.runEvery(1000 * 60 * 60, update);
  // wait.runEvery(1000, update);
}

export function update() {
  let map = mapui.map;
  $.getJSON(`/lsalt/gafareas`, (data) => {
    let source = <GeoJSONSource>map.getSource(sourceID);
    source.setData(data);
    console.log("update gafareas")
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
    "id": `gafareas`,
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