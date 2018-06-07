// area_data is keyed by gafAreaCodes (QLD-S,TAS)
var areaData = {};
var mapAreasByAreaCode = {};
var mapAreasByLayerID = {};
var mapAreasOutlineIDs = [];

// combinedMapArea["QLD-S-A"] will return [MapMajorArea("A"), MapSubArea("A1")]
var combinedMapArea = {};

var initialZoom = true;

var gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];

var cssHeightColors = {
  0: "#BB0EC9",
  1: "#DF8211",
  2: "#FCFC00",
  3: "#99DAAA",
}

// From https://stackoverflow.com/a/21903119/36170
function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
      }
  }
};

var period = getUrlParameter("period") || "current";
var vfr = getUrlParameter("vfr") || "day";
var nightVFR = (vfr == "night");
document.textColor = "#f00"; // day vfr

$(function () {
  map.on('load', function () {
    if (!nightVFR) {
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
    }
  });

  map.on("dragend", function(e) {
    updateGAFTableFromVisibleAreas();
  });

  map.on("dragend", function(e) {
    updateLSALTFromVisibleAreas(nightVFR);
  });

  map.on('load', function () {
    zoomCurrentLocation(map);
  });
});

function setupMapForGAFArea(gafAreaCode, data) {
  // TODO: can use gafData instead
  areaData[gafAreaCode] = data;
  mapAreasByAreaCode[gafAreaCode] = [];

  setupGAFBoundary(map, gafAreaCode, data);

  data["areas"].forEach(area => {
    // TODO: Delegate creation to maparea.js so it can curate global variables
    var mapArea = new MapMajorArea(gafAreaCode, area);
    mapAreasByAreaCode[gafAreaCode].push(mapArea);
    combinedMapArea[mapArea.gafAreaCodeAndGroup()] = [mapArea];

    setupMapFill(mapArea);

    area["sub-areas"].forEach(subArea => {
      var mapSubArea = new MapSubArea(mapArea, subArea);
      mapAreasByAreaCode[gafAreaCode].push(mapSubArea);
      combinedMapArea[mapArea.gafAreaCodeAndGroup()].push(mapSubArea);
      setupMapFill(mapSubArea);
    });

    addAreaToGAFTable(mapArea);
  });

  updateLSALTFromVisibleAreas(nightVFR);
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
      "line-width": 0
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

// mapArea is MapMajorArea or MapSubArea
function setupMapFill(mapArea) {

  var baseID = mapArea.uuid();
  var layerID = mapArea.mapLayerID();
  mapAreasByLayerID[layerID] = mapArea;

  var labelID = "label-" + baseID;
  var outlineID = "outline-" + baseID;
  mapAreasOutlineIDs.push(outlineID);

  // 1000ft AGL matches to .height-1 in main.css
  var fillColor = mapArea.cloudBaseColor();

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
    },
    "paint": {
      "text-color": document.textColor
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

  map.on('moveend', function(e){
    if(initialZoom){
      initialZoom = false;
      updateGAFTableFromVisibleAreas();
      updateLSALTFromVisibleAreas(nightVFR);
    }
 });
}

