// area_data is keyed by gafAreaCodes (QLD-S,TAS)
document.areaData = {};
document.mapAreas = {};

function randomID() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

$(function () {
  var areaData = document.areaData;
  var mapAreas = document.mapAreas;

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

  // mapArea is MapArea or MapSubArea
  function setupMapFill(mapArea) {

    var baseID = randomID();
    var layerID = "area-fills-" + baseID;
    var labelID = "label-" + baseID;

    // 1000ft AMSL matches to .height-1 in main.css
    var areaCloudLayerBase = mapArea.cloudBase() === undefined ? 10000 : mapArea.cloudBase();
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

    var areaLayerFeature = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [mapArea.boundaryPoints()]
      }
    };
    map.addSource(layerID, {
      "type": "geojson",
      "data": areaLayerFeature
    });

    map.addLayer({
      "id": layerID,
      "type": "fill",
      "source": layerID,
      "paint": {
        "fill-color": fillColor,
        "fill-opacity": 0.2
      }
    });

    areaCenter = turf.center(areaLayerFeature, 1);
    areaCenter.properties = {"title": mapArea.mapLabel()}
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


    // var gafPageCode = document.gafPageCode
    // map.on("mousemove", layerID, function(e) {
    //   table = $('#gaf-' + gafPageCode);
    //   table.find('.area-' + gafPageCode + '-' + areaID).addClass("area-selected");
    //   if (subAreaID) {
    //     table.find('.sub-area-mentioned-' + subAreaID).addClass("sub-area-selected");
    //   }
    // });

    // map.on("mouseleave", layerID, function() {
    //   table = $('#gaf-' + gafPageCode);
    //   table.find('.area-' + gafPageCode + '-' + areaID).removeClass("area-selected");
    //   if (subAreaID) {
    //     table.find('.sub-area-mentioned-' + subAreaID).removeClass("sub-area-selected");
    //   }
    // });
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
  });

  map.on('load', function () {
    var gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];
    gafAreaCodes.forEach(gafAreaCode => {
      $.get("/api/gafarea/" + gafAreaCode + "/current.json", function(data) {
        areaData[gafAreaCode] = data;
        mapAreas[gafAreaCode] = [];

        setupGAFBoundary(map, gafAreaCode, data);

        data["areas"].forEach(area => {
          var mapArea = new MapMajorArea(gafAreaCode, area);
          mapAreas[gafAreaCode].push(mapArea);

          setupMapFill(mapArea);

          area["sub-areas"].forEach(subArea => {
            var mapSubArea = new MapSubArea(mapArea, subArea);
            mapAreas[gafAreaCode].push(mapSubArea);
            setupMapFill(mapSubArea);
          });
        });

        // allow lsalt.js to start intersecting with areas
        updateLSALT(gafAreaCode);

        if (document.gafAreaCode == gafAreaCode) {
          zoomGAFArea(map, gafAreaCode, data);
        }
      });
    });


  });
});