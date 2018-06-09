declare var map: mapboxgl.Map;

function gafTable() {
  return $("#gaf-table");
}

let latestMouseoverArea;
let combinedMapAreaBoundaryPoints = {};

function updateGAFTableFromVisibleAreas() {
  var visibleMajorAreas = majorAreas(mapAreasInCurrentView());
  var visibleAreaGroupClasses = {};
  visibleMajorAreas.forEach(mapMajorArea => {
    visibleAreaGroupClasses[`gaf-${mapMajorArea.gafAreaCodeAndGroup()}`] = true;
  });

  gafTable().find("table tr").each(function() {
    var classes = $(this).attr("class");
    if (classes !== undefined) {
      classes.split(/\s+/).forEach(className => {
        if (className.startsWith(`gaf-`)) {
          if (visibleAreaGroupClasses[className]) {
            $(this).show();
          } else {
            $(this).hide();
          }
        }
      });
    }
  });

  gafTable().find("table tr td.area-label").mouseover(function() {
    var showGAFArea = $(this).parent().data()["gafArea"];
    if (showGAFArea !== undefined && latestMouseoverArea != showGAFArea) {
      latestMouseoverArea = showGAFArea;
      latestMouseoverAreaLayer = showGAFArea;
      if (combinedMapAreaBoundaryPoints[showGAFArea] === undefined) {
        var areas = combinedMapArea[showGAFArea];
        var areaBoundaryPoints = areas.reduce((points, area) => {
          return points.concat(area.boundaryPoints());
        }, []);

        // Pass the first coordinates in the LineString to `lngLatBounds` &
        // wrap each coordinate pair in `extend` to include them in the bounds
        // result. A variation of this technique could be applied to zooming
        // to the bounds of multiple Points or Polygon geomteries - it just
        // requires areaBoundaryPoints all the coordinates with the extend method.
        var bounds = areaBoundaryPoints.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(areaBoundaryPoints[0], areaBoundaryPoints[0]));

        combinedMapAreaBoundaryPoints[showGAFArea] = bounds;

        var mapSource = `combined-area-boundary-${showGAFArea}`;
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

      var gafAreaCode = combinedMapArea[showGAFArea][0].gafAreaCode();

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
  })
}

function addAreaToGAFTable(majorMapArea) {
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
  var wxCondsCount = majorMapArea.wxConds().length;

  var tbody = $("#gaf-table table tbody");
  majorMapArea.wxConds().forEach((wxCond, index) => {
    var row = $(`<tr>`);
    row.addClass(`gaf-${majorMapArea.gafAreaCodeAndGroup()}`);
    row.data(`gaf-area`, majorMapArea.gafAreaCodeAndGroup());

    if (index === 0) {
      var areaCol = $(`<td class="area-label">`);
      areaCol.attr("rowspan", wxCondsCount);
      areaCol.text(`${majorMapArea.gafAreaCode()} - ${majorMapArea.mapLabel()}`);
      areaCol.appendTo(row);
    }

    var surfaceVis = wxCond["surface-vis-wx"];
    var surfaceVisCol = $(`<td>`);
    surfaceVisCol.text(surfaceVis["text"]);
    (surfaceVis["sub-areas-mentioned"] || []).forEach(subareaLabel => {
      surfaceVisCol.addClass(`subarea-mentioned-${subareaLabel}`);
    })
    surfaceVisCol.appendTo(row);

    var cloudIceCol = $(`<td>`);
    wxCond["cloud-ice-turb"].forEach(cloudIce => {
      var cloudIcePart = $(`<div>`);
      (cloudIce["sub-areas-mentioned"] || []).forEach(subareaLabel => {
        cloudIcePart.addClass(`subarea-mentioned-${subareaLabel}`);
      })
      cloudIcePart.text(cloudIce["text"]);
      cloudIcePart.appendTo(cloudIceCol);
    });
    cloudIceCol.appendTo(row);

    if (index === 0) {
      var freezingLevelCol = $(`<td>`);
      freezingLevelCol.attr("rowspan", wxCondsCount);
      freezingLevelCol.text(majorMapArea.freezingLevel());
      freezingLevelCol.appendTo(row);
    }

    row.hide();
    row.appendTo(tbody);
  });
}