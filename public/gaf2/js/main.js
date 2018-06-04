// area_data is keyed by gafAreaCodes (QLD-S,TAS)
document.areaData = {};
document.mapAreasByAreaCode = {};
document.mapAreasByLayerID = {};
document.mapAreasOutlineIDs = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

$(function () {
  var areaData = document.areaData;
  var mapAreasByAreaCode = document.mapAreasByAreaCode;
  var mapAreasByLayerID = document.mapAreasByLayerID;
  var mapAreasOutlineIDs = document.mapAreasOutlineIDs;

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

  function zoomCurrentLocation(map) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        var long = position.coords.longitude;
        var lat = position.coords.latitude;
        map.zoomIn({zoom: 6, center: [long, lat]});
      });
    }
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

    var baseID = mapArea.uuid();
    var layerID = mapArea.mapLayerID();
    mapAreasByLayerID[layerID] = mapArea;

    var labelID = "label-" + baseID;
    var outlineID = "outline-" + baseID;
    mapAreasOutlineIDs.push(outlineID);

    // 1000ft AMSL matches to .height-1 in main.css
    var areaCloudLayerBase = mapArea.cloudBase() === undefined ? 10000 : mapArea.cloudBase();
    var areaCloudLayerBaseCode = Math.round(areaCloudLayerBase / 1000);
    areaCloudLayerBaseCode = Math.min(10, Math.max(0, areaCloudLayerBaseCode));
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

    var areaLayerFeature = mapAreaAsFeature(mapArea);

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

    map.addLayer({
      "id": outlineID,
      "type": "line",
      "source": layerID,
      "layout": {
        "line-join": "round", "line-cap": "round"
      },
      "paint": {
        "line-color": fillColor, "line-width": 2
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

    updateGAFTableFromVisibleAreas();

    var gafPageCode = document.gafPageCode
    map.on("mousemove", layerID, function(e) {
      table = gafTable();
      table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()}`).addClass("area-selected");
      if (mapArea.isSubArea()) {
        table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()} .subarea-mentioned-${mapArea.subAreaID()}`).addClass("sub-area-selected");
      }
    });

    map.on("mouseleave", layerID, function() {
      table = gafTable();
      table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()}`).removeClass("area-selected");
      if (mapArea.isSubArea()) {
        table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()} .subarea-mentioned-${mapArea.subAreaID()}`).removeClass("sub-area-selected");
      }
    });

    map.on("mouseover", layerID, function(e) {
      var text = mapArea.mapLabel();
      if (mapArea.cloudBase() === undefined || mapArea.cloudBase() === 999999) {
        text += " has N/A clouds";
      } else {
        text += " has cloud base " + mapArea.cloudBase() + "MSL";
      }
      $('#mouseover-summary-area').text(text);
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
  });

  map.on("dragend", function(e) {
    updateGAFTableFromVisibleAreas();
  });

  map.on('load', function () {
    zoomCurrentLocation(map);

    var gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];
    gafAreaCodes.forEach(gafAreaCode => {
      $.get("/api/gafarea/" + gafAreaCode + "/current.json", function(data) {
        areaData[gafAreaCode] = data;
        mapAreasByAreaCode[gafAreaCode] = [];

        setupGAFBoundary(map, gafAreaCode, data);

        data["areas"].forEach(area => {
          var mapArea = new MapMajorArea(gafAreaCode, area);
          mapAreasByAreaCode[gafAreaCode].push(mapArea);

          setupMapFill(mapArea);

          area["sub-areas"].forEach(subArea => {
            var mapSubArea = new MapSubArea(mapArea, subArea);
            mapAreasByAreaCode[gafAreaCode].push(mapSubArea);
            setupMapFill(mapSubArea);
          });

          addAreaToGAFTable(mapArea);
        });

        // allow lsalt.js to start intersecting with areas
        // updateLSALT(gafAreaCode);
      });
    });

  });
});