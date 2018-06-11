"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
const mapui = require("../mapui");
const gafarea = require("../data/gafarea");
const maparea = require("../data/maparea");
let latestMouseoverArea;
let combinedMapAreaBoundaryPoints = {};
function init() {
    mapui.map.on("dragend", update);
    mapui.map.on("zoomend", update);
}
exports.init = init;
// TODO: prioritize entire areas that are entirely within map bounds; then MapAreas entirely within map bounds; then others
// TODO: prioritize area underneath cursor or recently clicked
function update() {
    let map = mapui.map;
    let visibleMajorAreas = maparea.majorAreas(maparea.mapAreasInCurrentView());
    let visibleAreaGroupClasses = {};
    visibleMajorAreas.forEach((mapMajorArea) => {
        visibleAreaGroupClasses[`gaf-${mapMajorArea.gafAreaCodeAndGroup()}`] = true;
    });
    $("#gaf-table table tr").each(function () {
        let classes = $(this).attr("class");
        if (classes !== undefined) {
            classes.split(/\s+/).forEach(className => {
                if (className.startsWith(`gaf-`)) {
                    if (visibleAreaGroupClasses[className]) {
                        $(this).show();
                    }
                    else {
                        $(this).hide();
                    }
                }
            });
        }
    });
    $("#gaf-table table tr td.area-label").mouseover(function () {
        let showGAFArea = $(this).parent().data()["gafArea"];
        if (showGAFArea !== undefined && latestMouseoverArea != showGAFArea) {
            latestMouseoverArea = showGAFArea;
            if (combinedMapAreaBoundaryPoints[showGAFArea] === undefined) {
                let areas = gafarea.combinedMapArea[showGAFArea];
                let areaBoundaryPoints = areas.reduce((points, area) => {
                    return points.concat(area.boundaryPoints());
                }, []);
                // Pass the first coordinates in the LineString to `lngLatBounds` &
                // wrap each coordinate pair in `extend` to include them in the bounds
                // result. A letiation of this technique could be applied to zooming
                // to the bounds of multiple Points or Polygon geomteries - it just
                // requires areaBoundaryPoints all the coordinates with the extend method.
                let bounds = areaBoundaryPoints.reduce((bounds, coord) => {
                    return bounds.extend(coord);
                }, [areaBoundaryPoints[0], areaBoundaryPoints[0]]);
                combinedMapAreaBoundaryPoints[showGAFArea] = bounds;
                let mapSource = `combined-area-boundary-${showGAFArea}`;
                map.addSource(mapSource, {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": bounds
                        }
                    }
                });
            }
            // let gafAreaCode = gafarea.combinedMapArea[showGAFArea][0].gafAreaCode;
            // TODO: no idea why this layer line doesn't appear
            // if (map.getLayer("mouseover-area-highlight")) {
            //   map.removeLayer("mouseover-area-highlight");
            // }
            // map.addLayer({
            //   "id": "mouseover-area-highlight",
            //   "type": "line",
            //   "source": `combined-area-boundary-${showGAFArea}`,
            //   "layout": {
            //     "line-join": "round", "line-cap": "round"
            //   },
            //   "paint": {
            //     "line-color": "#333", "line-width": 10, "line-offset": 50
            //   }
            // });
            // }, `gaf-${gafAreaCode}`);
            map.fitBounds(combinedMapAreaBoundaryPoints[latestMouseoverArea], {
                padding: 20
            });
        }
    });
}
exports.update = update;
function addGAFArea(mapMajorArea) {
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
    let wxCondsCount = mapMajorArea.wxConds().length;
    let tbody = $("#gaf-table table tbody");
    mapMajorArea.wxConds().forEach((wxCond, index) => {
        let row = $(`<tr>`);
        row.addClass(`gaf-${mapMajorArea.gafAreaCodeAndGroup()}`);
        row.data(`gaf-area`, mapMajorArea.gafAreaCodeAndGroup());
        if (index === 0) {
            let areaCol = $(`<td class="area-label">`);
            areaCol.attr("rowspan", wxCondsCount);
            areaCol.text(`${mapMajorArea.gafAreaCode} - ${mapMajorArea.mapLabel()}`);
            areaCol.appendTo(row);
        }
        let surfaceVis = wxCond.surface_vis_wx;
        let surfaceVisCol = $(`<td>`);
        surfaceVisCol.text(surfaceVis["text"]);
        (surfaceVis.sub_areas_mentioned || []).forEach(subareaLabel => {
            surfaceVisCol.addClass(`subarea-mentioned-${subareaLabel}`);
        });
        surfaceVisCol.appendTo(row);
        let cloudIceCol = $(`<td>`);
        wxCond.cloud_ice_turb.forEach(cloudIce => {
            let cloudIcePart = $(`<div>`);
            (cloudIce.sub_areas_mentioned || []).forEach(subareaLabel => {
                cloudIcePart.addClass(`subarea-mentioned-${subareaLabel}`);
            });
            cloudIcePart.text(cloudIce["text"]);
            cloudIcePart.appendTo(cloudIceCol);
        });
        cloudIceCol.appendTo(row);
        if (index === 0) {
            let freezingLevelCol = $(`<td>`);
            freezingLevelCol.attr("rowspan", wxCondsCount);
            freezingLevelCol.text(mapMajorArea.freezingLevel());
            freezingLevelCol.appendTo(row);
        }
        row.hide();
        row.appendTo(tbody);
    });
}
exports.addGAFArea = addGAFArea;
