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
  let wxCondsCount = majorArea.wxConds.length;
  console.log(`${majorArea.gafAreaCodeAndGroup} - ${wxCondsCount}`);
  let tbody = $("#gaf-table table tbody");
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

    // row.hide();
    row.appendTo(tbody);
  });  
}  




//     row.hide();
//     row.appendTo(tbody);
//   });
// }

// export function removeAll() {
//   $("#gaf-table").text("");
// }

// // TODO: prioritize entire areas that are entirely within map bounds; then MapAreas entirely within map bounds; then others
// // TODO: prioritize area underneath cursor or recently clicked
// // export function update() {
// //   let map = mapui.map;

// //   $("#gaf-table table tr").each(function() {
// //     let classes = $(this).attr("class");
// //     if (classes !== undefined) {
// //       classes.split(/\s+/).forEach(className => {
// //         if (className.startsWith(`gaf-`)) {
// //           $(this).show();
// //         }
// //       });
// //     }
// //   });

// //   $("#gaf-table table tr td.area-label").mouseover(function() {
// //     let showGAFArea = $(this).parent().data()["gafArea"];
// //     if (showGAFArea !== undefined && latestMouseoverArea != showGAFArea) {
// //       latestMouseoverArea = showGAFArea;
// //       if (combinedMapAreaBoundaryPoints[showGAFArea] === undefined) {
// //         let areas = gafarea.combinedMapArea[showGAFArea];
// //         let areaBoundaryPoints = areas.reduce((points, area) => {
// //           return points.concat(area.boundaryPoints());
// //         }, []);

// //         // Pass the first coordinates in the LineString to `lngLatBounds` &
// //         // wrap each coordinate pair in `extend` to include them in the bounds
// //         // result. A letiation of this technique could be applied to zooming
// //         // to the bounds of multiple Points or Polygon geomteries - it just
// //         // requires areaBoundaryPoints all the coordinates with the extend method.
// //         let bounds = areaBoundaryPoints.reduce((bounds, coord) => {
// //           return bounds.extend(coord);
// //         }, new mapboxgl.LngLatBounds(areaBoundaryPoints[0], areaBoundaryPoints[0]));

// //         combinedMapAreaBoundaryPoints[showGAFArea] = bounds;

// //         let mapSource = `combined-area-boundary-${showGAFArea}`;
// //         map.addSource(mapSource, {
// //           "type": "geojson",
// //           "data": {
// //             "type": "Feature",
// //             "properties": {},
// //             "geometry": {
// //               "type": "LineString",
// //               "coordinates": bounds
// //             }
// //           }
// //         });
// //       }

// //       // let gafAreaCode = gafarea.combinedMapArea[showGAFArea][0].gafAreaCode;

// //       // TODO: no idea why this layer line doesn't appear
// //       // if (map.getLayer("mouseover-area-highlight")) {
// //       //   map.removeLayer("mouseover-area-highlight");
// //       // }
// //       // map.addLayer({
// //       //   "id": "mouseover-area-highlight",
// //       //   "type": "line",
// //       //   "source": `combined-area-boundary-${showGAFArea}`,
// //       //   "layout": {
// //       //     "line-join": "round", "line-cap": "round"
// //       //   },
// //       //   "paint": {
// //       //     "line-color": "#333", "line-width": 10, "line-offset": 50
// //       //   }
// //       // });
// //       // }, `gaf-${gafAreaCode}`);

// //       map.fitBounds(combinedMapAreaBoundaryPoints[latestMouseoverArea], {
// //         padding: 20
// //       });
// //     }
// //   })
// // }

