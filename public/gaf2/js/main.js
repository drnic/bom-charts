$(function () {

  function randomID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function setupGAFBoundary(map, areaCode, data) {
    var gafBoundary = data["boundary"]["points"];

    map.addSource("gaf-" + areaCode, {
      "type": "geojson",
      "data": {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": gafBoundary
        }
      }
    });

    map.addLayer({
      "id": "gaf-" + areaCode,
      "type": "line",
      "source": "gaf-" + areaCode,
      "layout": {
        "line-join": "round", "line-cap": "round"
      },
      "paint": {
        "line-color": "#888", "line-width": 1
      }
    });
  }

  function zoomGAFArea(map, areaCode, data) {
    var gafBoundary = data["boundary"]["points"];

    // Pass the first coordinates in the LineString to `lngLatBounds` &
    // wrap each coordinate pair in `extend` to include them in the bounds
    // result. A variation of this technique could be applied to zooming
    // to the bounds of multiple Points or Polygon geomteries - it just
    // requires wrapping all the coordinates with the extend method.
    var bounds = gafBoundary.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(gafBoundary[0], gafBoundary[0]));

    map.fitBounds(bounds, {
      padding: 20
    });
  }

  function setupAreaBoundary(map, areaCode, area, fillColor) {
    var gafBoundary = area["boundary"]["points"];

    var id = area["sub-area-id"] || area["area-id"];
    var baseID = randomID();
    var layerID = "area-fills-" + baseID;
    var labelID = "label-" + baseID;

    // 1000ft AMSL matches to .height-1 in main.css
    var areaCloudLayerBase = area["cloud-base"] === undefined ? 10000 : area["cloud-base"];
    var areaCloudLayerBaseCode = Math.round(areaCloudLayerBase / 1000);
    var cssHeightColors = {
      0: "#BB0EC9",
      1: "#BB0EC9",
      2: "#E30A35",
      3: "#590AE3",
      4: "#0ABCE3",
      5: "#99DAAA",
      6: "#99DAAA",
      7: "#99DAAA",
      8: "#99DAAA",
      9: "#99DAAA",
      10: "#99DAAA",
    }
    var fillColor = cssHeightColors[areaCloudLayerBaseCode];

    var areaGeoJSON = {
      "type": "Feature",
      "properties": area,
      "geometry": {
        "type": "Polygon",
        "coordinates": [gafBoundary]
      }
    }

    map.addLayer({
      "id": layerID,
      "type": "fill",
      "source": {"type": "geojson", "data": areaGeoJSON},
      "paint": {
        "fill-color": fillColor,
        "fill-opacity": 0.5
      }
    });

    areaCenter = turf.center(areaGeoJSON, 1);
    areaCenter.properties = {"title": id}
    map.addLayer({
      "id": labelID,
      "type": "symbol",
      "source": {
          "type": "geojson",
          "data": areaCenter
      },
      "layout": {
          "text-field": "{title}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-anchor": "top"
      }
    });


    var gafPageCode = document.gafPageCode
    var areaID = area["area-id"];
    var subAreaID = area["sub-area-id"]; // only if this is a sub-area zone

    map.on("mousemove", layerID, function(e) {
      table = $('#gaf-' + gafPageCode);
      table.find('.area-' + gafPageCode + '-' + areaID).addClass("area-selected");
      if (subAreaID) {
        table.find('.sub-area-mentioned-' + subAreaID).addClass("sub-area-selected");
      }
    });

    map.on("mouseleave", layerID, function() {
      table = $('#gaf-' + gafPageCode);
      table.find('.area-' + gafPageCode + '-' + areaID).removeClass("area-selected");
      if (subAreaID) {
        table.find('.sub-area-mentioned-' + subAreaID).removeClass("sub-area-selected");
      }
    });
  }

  map.on('load', function () {
    map.addSource('dem', {
      "type": "raster-dem",
      "url": "mapbox://mapbox.terrain-rgb"
    });
    map.addLayer({
        "id": "hillshading",
        "source": "dem",
        "type": "hillshade"
      // insert below waterway-river-canal-shadow;
      // where hillshading sits in the Mapbox Outdoors style
    }, 'waterway-river-canal-shadow');

    var gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];
    gafAreaCodes.forEach(gafAreaCode => {
      $.get("/api/gafarea/" + gafAreaCode + "/current.json", function(data) {
        setupGAFBoundary(map, gafAreaCode, data);
        data["areas"].forEach(area => {
          setupAreaBoundary(map, gafAreaCode, area);

          area["sub-areas"].forEach(subArea => {
            setupAreaBoundary(map, gafAreaCode, subArea);
          });
        });
        if (document.gafAreaCode == gafAreaCode) {
          zoomGAFArea(map, gafAreaCode, data);
        }
      });
    });

    var gafAreaCode = "QLD-S";
    $.get("/json/lsalt-" + gafAreaCode + ".json?" + new Date().getTime(), function (data) {
      // TODO: better way to wait for source to be defined
      var gafAreaSource = map.getSource("gaf-" + gafAreaCode);
      while (gafAreaSource === undefined) {
        sleep(100);
        var gafAreaSource = map.getSource("gaf-" + gafAreaCode);
      }
      var gafAreaPolygon = turf.polygon([gafAreaSource._data.geometry.coordinates]);

      data.forEach(lsaltGrid => {
        var grid = lsaltGrid["grid"]
        var lsalt = lsaltGrid["lsalt-100ft"];
        var baseID = randomID();

        var lsaltPolygon = turf.polygon([grid]);

        var lsaltIntersection = turf.intersect(gafAreaPolygon, lsaltPolygon)
        if (lsaltIntersection == undefined) {
          console.log("lsalt grid outside area: ", lsaltGrid);
          return;
        }

        map.addLayer({
          "id": "lsalt-" + baseID,
          "type": "line",
          "source": {
            "type": "geojson", "data": {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "LineString",
                "coordinates": grid
              }
            }
          },
          "layout": {
            "line-join": "round", "line-cap": "round"
          },
          "paint": {
            "line-color": "#888", "line-width": 1
          }
        });
      });
    });
  });
});