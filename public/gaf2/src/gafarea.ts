import * as $ from 'jquery';
import * as controller from "./controller";
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as wait from "./helpers/wait";
import { GeoJSONSource } from 'mapbox-gl';
import { FeatureCollection } from 'geojson';

export let sourceID = `gafareas`;

export function init() {
  update();
  wait.runEvery(1000 * 60 * 60, update);
  // wait.runEvery(1000, update);
}

function update() {
  let map = mapui.map;
  $.getJSON(`/api2/gafareas-features?period=${controller.period}`, (data) => {
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

    $('#mouseover-summary-area').text(feature.properties.wxSummary);
    let groupLabel = feature.properties["groupLabel"];
    $(`#gaf-table tbody tr`).hide();
    $(`#gaf-table tbody tr.gaf-${groupLabel}`).show();

    $(`#gaf-table tbody tr .subarea-mentioned`).removeClass("sub-area-selected");
    if (feature.properties.subAreaID) {
      $(`#gaf-table tbody tr.gaf-${feature.properties.groupLabel} .subarea-mentioned-${feature.properties.subAreaID}`).addClass("sub-area-selected");
    }
});

  // Reset the gafareas-hover layer's filter when the mouse leaves the layer.
  map.on("mouseleave", "gafareas", function() {
    map.setFilter("gafareas-hover", ["==", "mapLayerID", ""]);

    $('#mouseover-summary-area').text('');
    $(`#gaf-table tbody tr .subarea-mentioned`).removeClass("sub-area-selected");
  });

}
