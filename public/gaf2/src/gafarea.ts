import * as $ from 'jquery';
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as wait from "./helpers/wait";
import { GeoJSONSource } from 'mapbox-gl';
import { FeatureCollection } from 'geojson';

let sourceID = `gafareas`;

export function init() {
  update();
  wait.runEvery(1000 * 60 * 60, update);
  // wait.runEvery(1000, update);
}

function update() {
  let map = mapui.map;
  $.getJSON(`/gafareas/features`, (data) => {
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
    "id": "gafareas",
    "type": "fill",
    "source": sourceID,
    "paint": {
      "fill-color": {
        property: "lsaltColorLevel",
        stops: theme.cssHeightColorsStops,
      },
      "fill-antialias": false,
      "fill-opacity": 0.2
    }
  });

  map.addLayer({
    "id": "gafareas-borders",
    "type": "line",
    "source": sourceID,
    "layout": {},
    "paint": {
      "line-color": {
        property: "lsaltColorLevel",
        stops: theme.cssHeightColorsStops,
      },
      "line-width": 2
    }
  });

  map.addLayer({
    "id": "gafareas-hover",
    "type": "fill",
    "source": sourceID,
    "paint": {
      "fill-color": {
        property: "lsaltColorLevel",
        stops: theme.cssHeightColorsStops,
      },
      "fill-antialias": false,
      "fill-opacity": 0.2 // combines with 0.5 from original layer
    },
    "filter": ["==", "mapLayerID", ""]
  });

  map.on("mousemove", "gafareas", function(e: FeatureCollection) {
    let feature = e.features[0];
    map.setFilter("gafareas-hover", ["==", "mapLayerID", feature.properties.mapLayerID]);
  });

  // Reset the gafareas-hover layer's filter when the mouse leaves the layer.
  map.on("mouseleave", "gafareas", function() {
      map.setFilter("gafareas-hover", ["==", "mapLayerID", ""]);
  });

}
