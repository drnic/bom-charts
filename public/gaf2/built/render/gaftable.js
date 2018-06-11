"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
function addGAFArea(mapMajorArea) {
    if ($("#gaf-table table").length === 0) {
        var table = $(`
    <table border="1">
      <thead>
        <tr><th>Area</th><th>Surface, Vis & Wx</th><th>Cloud, Icing, & Turbulance</th><th>Freezing level</th></tr>
      </thead>
      <tbody></tbody>
    </table>`);
        table.appendTo($("#gaf-table"));
    }
    var wxCondsCount = mapMajorArea.wxConds().length;
    var tbody = $("#gaf-table table tbody");
    mapMajorArea.wxConds().forEach((wxCond, index) => {
        var row = $(`<tr>`);
        row.addClass(`gaf-${mapMajorArea.gafAreaCodeAndGroup()}`);
        row.data(`gaf-area`, mapMajorArea.gafAreaCodeAndGroup());
        if (index === 0) {
            var areaCol = $(`<td class="area-label">`);
            areaCol.attr("rowspan", wxCondsCount);
            areaCol.text(`${mapMajorArea.gafAreaCode} - ${mapMajorArea.mapLabel()}`);
            areaCol.appendTo(row);
        }
        var surfaceVis = wxCond.surface_vis_wx;
        var surfaceVisCol = $(`<td>`);
        surfaceVisCol.text(surfaceVis["text"]);
        (surfaceVis.sub_areas_mentioned || []).forEach(subareaLabel => {
            surfaceVisCol.addClass(`subarea-mentioned-${subareaLabel}`);
        });
        surfaceVisCol.appendTo(row);
        var cloudIceCol = $(`<td>`);
        wxCond.cloud_ice_turb.forEach(cloudIce => {
            var cloudIcePart = $(`<div>`);
            (cloudIce.sub_areas_mentioned || []).forEach(subareaLabel => {
                cloudIcePart.addClass(`subarea-mentioned-${subareaLabel}`);
            });
            cloudIcePart.text(cloudIce["text"]);
            cloudIcePart.appendTo(cloudIceCol);
        });
        cloudIceCol.appendTo(row);
        if (index === 0) {
            var freezingLevelCol = $(`<td>`);
            freezingLevelCol.attr("rowspan", wxCondsCount);
            freezingLevelCol.text(mapMajorArea.freezingLevel());
            freezingLevelCol.appendTo(row);
        }
        // row.hide();
        row.appendTo(tbody);
    });
}
exports.addGAFArea = addGAFArea;
