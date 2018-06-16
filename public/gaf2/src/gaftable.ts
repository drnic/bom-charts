import * as $ from 'jquery';
import * as turf from '@turf/helpers';

import * as mapui from "./mapui";
import * as maparea from "./data/maparea";
import * as wait from "./helpers/wait";

export function init() {
  load();
  wait.runEvery(1000 * 60 * 60, load);
  // mapui.map.on("dragend", update);
  // mapui.map.on("zoomend", update);

}

function load() {
  let map = mapui.map;

  $.getJSON(`/api2/mapareas/major`, (majorAreas: maparea.MapAreaImport[]) => {
    majorAreas.forEach((majorArea: maparea.MapAreaImport) => {
      addGAFArea(majorArea);
    });

    $.getJSON(`/api2/gafareas-envelopes`, (envelopes: turf.FeatureCollection) => {
      $("#gaf-table table tr td.area-label").mouseover((evt) => {
        var gafArea = $(evt.target).parent().data()["gafArea"];
        var areaFeature = envelopes.features.find((feature: turf.Feature) => {
          return feature.properties["groupLabel"] == gafArea;
        });

        let coordinates = (areaFeature as turf.Feature<turf.Geometry>).geometry.coordinates;
        let points = (coordinates[0] as turf.Coord[]);
        let corner1 = (points[0] as number[]);
        let corner2 = (points[1] as number[]);
        map.fitBounds([corner1, corner2], {
          padding: 20
        });
      });
    })
  });
}

export function addGAFArea(majorArea: maparea.MapAreaImport) {
  if ($("#gaf-table table").length === 0) {
    let table = $(`
    <table border="1">
      <thead>
        <tr><th>Area</th><th>Surface, Vis & Wx</th><th>Cloud, Icing, & Turbulance</th><th>Freezing level</th></tr>
      </thead>
      <tbody></tbody>
    </table>`);
    table.appendTo($("#gaf-table"));
  }
  let tbody = $("#gaf-table table tbody");

  let wxCondsCount = majorArea.wxConds.length;
  majorArea.wxConds.forEach((wxCond, index) => {
    let row = $(`<tr>`);
    row.addClass(`gaf-${majorArea.gafAreaCodeAndGroup}`);
    row.data(`gaf-area`, majorArea.gafAreaCodeAndGroup);

    if (index === 0) {
      let areaCol = $(`<td class="area-label">`);
      areaCol.attr("rowspan", wxCondsCount);
      areaCol.text(`${majorArea.gafAreaCode} - ${majorArea.mapLabel}`);
      areaCol.appendTo(row);
    }

    let surfaceVis = wxCond.surface_vis_wx;
    let surfaceVisCol = $(`<td>`);
    surfaceVisCol.text(surfaceVis["text"]);
    (surfaceVis.sub_areas_mentioned || []).forEach(subareaLabel => {
      surfaceVisCol.addClass(`subarea-mentioned-${subareaLabel}`);
    })
    surfaceVisCol.appendTo(row);

    let cloudIceCol = $(`<td>`);
    wxCond.cloud_ice_turb.forEach(cloudIce => {
      let cloudIcePart = $(`<div>`);
      (cloudIce.sub_areas_mentioned || []).forEach(subareaLabel => {
        cloudIcePart.addClass(`subarea-mentioned-${subareaLabel}`);
      })
      cloudIcePart.text(cloudIce["text"]);
      cloudIcePart.appendTo(cloudIceCol);
    });
    cloudIceCol.appendTo(row);

    if (index === 0) {
      let freezingLevelCol = $(`<td>`);
      freezingLevelCol.attr("rowspan", wxCondsCount);
      freezingLevelCol.text(majorArea.freezingLevel);
      freezingLevelCol.appendTo(row);
    }

    row.hide();
    row.appendTo(tbody);
  });
}

// export function removeAll() {
//   $("#gaf-table").text("");
// }
