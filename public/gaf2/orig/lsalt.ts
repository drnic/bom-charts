declare var mapAreasByAreaCode : any;

import * as turf from "@turf/helpers";
import intersect from "@turf/intersect";
import * as maparea from "./maparea";

let lsaltData = {} as any;

gafAreaCodes.forEach(gafAreaCode => {
  // $.get(`/json/lsalt-${gafAreaCode}.json?${new Date().getTime()}`, function (data) {
  $.get(`/json/lsalt-${gafAreaCode}.json`, function (data) {
    lsaltData[gafAreaCode] = data;
    updateLSALT(gafAreaCode, nightVFR);
  });
});

function updateLSALTFromVisibleAreas(nightVFR: boolean) {
  maparea.gafAreaCodesFromMapAreas(maparea.mapAreasInCurrentView()).forEach((gafAreaCode: string) => {
    updateLSALT(gafAreaCode, nightVFR);
  });
}

let layerIDsForLSALT = {} as any;

function randomID() : string {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function updateLSALT(gafAreaCode: string, nightVFR: boolean) {
  var mapAreas = mapAreasByAreaCode[gafAreaCode];
  var lsaltGridsForArea = lsaltData[gafAreaCode];
  if (mapAreas === undefined || lsaltGridsForArea === undefined) {
    return;
  }
  if (layerIDsForLSALT[gafAreaCode]) {
    return;
  }
  layerIDsForLSALT[gafAreaCode] = [];

  lsaltGridsForArea.forEach((lsaltGrid: any) => {
    var grid = lsaltGrid["grid"]

    var lsalt = lsaltGrid["lsalt-100ft"];
    if (!nightVFR) {
      // assume pilot can see highest object; and that LSALT is 1300' higher than highest object
      lsalt -= 13;
    }

    var lsaltPolygon = turf.polygon([grid]);

    mapAreas.forEach((mapArea: maparea.MapAreaBase) => {
      var mapAreaPolygon = mapArea.turfPolygon();

      var lsaltIntersection = intersect(mapAreaPolygon, lsaltPolygon)
      if (lsaltIntersection === undefined) {
        return;
      }

      var layerID = "lsalt" + randomID();
      layerIDsForLSALT[gafAreaCode].push(layerID);

      var areaCloudLayerBase = mapArea.cloudBase() === undefined ? 10000 : mapArea.cloudBase();
      var cloudBaseLSALTDelta = areaCloudLayerBase - (lsalt * 100);
      var layerColourIndex = Math.round(cloudBaseLSALTDelta / 1000);
      layerColourIndex = Math.min(3, Math.max(0, layerColourIndex));
      var layerColour = cssHeightColors[layerColourIndex];

      if (mapArea.cloudBaseColor() != layerColour) {
        map.addLayer({
          "id": layerID,
          "type": "fill",
          "source": {
            "type": "geojson", "data": lsaltIntersection
          },
          "paint": {
            "fill-color": layerColour,
            "fill-antialias": false,
            "fill-opacity": 0.5
          }
        });

        map.on("mouseover", layerID, function(e) {
          map.setPaintProperty(layerID, "fill-opacity", 0.8);
          var text = "LSALT: " + lsaltGrid["lsalt-100ft"];
          $('#mouseover-summary-lsalt-grid').text(text);
        });

        map.on("mouseleave", layerID, function(e) {
          map.setPaintProperty(layerID, "fill-opacity", 0.5);
        });
      }
    });
  });
};
