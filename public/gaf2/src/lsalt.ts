import * as $ from 'jquery';
import * as controller from "./controller";
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as wait from "./helpers/wait";
import { GeoJSONSource, GeoJSONGeometry } from 'mapbox-gl';
import { FeatureCollection } from 'geojson';

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

  $.getJSON(`/api2/lsalt-features?vfr=${vfr}`, (data) => {
    let source = <GeoJSONSource>map.getSource(sourceID);
    if (source === undefined) {
      setupLayer();
      source = <GeoJSONSource>map.getSource(sourceID);
    }
    source.setData(data);
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
    "id": "lsalt",
    "type": "fill",
    "source": sourceID,
    "paint": {
      "fill-color": {
        property: "lsaltColorLevel",
        stops: theme.cssHeightColorsStops,
      },
      "fill-antialias": false,
      "fill-opacity": {
        property: "lsaltColorLevelSameAsArea",
        stops: [[0, 0.5], [1, 0.1]]
      }
    }
  });

  map.addLayer({
    "id": "lsalt-hover",
    "type": "fill",
    "source": sourceID,
    "paint": {
      "fill-color": {
        property: "lsaltColorLevel",
        stops: theme.cssHeightColorsStops,
      },
      "fill-antialias": false,
      "fill-opacity": 0.5
    },
    "filter": ["==", "id", ""]
  });

  map.on("mousemove", "lsalt", function(e: FeatureCollection) {
    let feature = e.features[0];
    selectFeature(feature);
  });

  // Reset the lsalt-hover layer's filter when the mouse leaves the layer.
  map.on("mouseleave", "lsalt", function() {
    map.setFilter("lsalt-hover", ["==", "id", ""]);
    $('#mouseover-summary-lsalt-grid').text('');
  });
}

export function selectFeature(feature: GeoJSON.Feature<GeoJSONGeometry>) {
  if (feature === undefined) {
    return;
  }

  mapui.map.setFilter("lsalt-hover", ["==", "id", feature.properties.id]);

  let lsalt = Math.max(0, feature.properties["lsalt"]);
  let text = `High point est: ${lsalt}ft`;
  if (controller.isNightVFR()) {
    text = `LSALT: ${lsalt}ft`;
  }
  $('#mouseover-summary-lsalt-grid').text(text);
}