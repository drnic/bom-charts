import * as $ from 'jquery';
import * as controller from "./controller";
import * as mapui from "./mapui";
import * as theme from "./theme";
import * as gafarea from "./data/gafarea";
import * as maparea from "./data/maparea";
import * as random from "./helpers/random";
import * as wait from "./helpers/wait";
import * as turf from "@turf/helpers";
import * as turfintersect from "@turf/intersect";

export interface LSALTGrid {
  grid: number[][];
  lsalt_100ft: number;
}

let lsaltData: { [gafAreaCode: string]: LSALTGrid[] } = {}

export function init() {
  update();
  wait.runEvery(1000 * 60 * 60, update);
}

function update() {
  let vfr = controller.vfr;
  $.getJSON(`/lsalt?vfr=${vfr}`, (data) => {
    console.log(data);
  });
}

var layerIDsForLSALT : { [gafAreaCode: string]: string[] } = {};

// TODO: could this be done once on the server for each GAF area/period?
// Perhaps server needs rewriting in nodejs so can use turfjs.intersect?
// Or perhaps golang calls out to nodejs CLIs to carve up XML + LSALT and cache on disk
// Schedule task that fetches XML -> S3 could also perform the carving with LSALT and store to S3
// Golang app can then fetch XML + carve up from S3 and cache in memory; rather than from BOM.
function updateLSALT(gafAreaCode: string) {
  return;
  let map = mapui.map;
  let nightVFR = controller.isNightVFR();

  var mapAreas = gafarea.mapAreasByAreaCode[gafAreaCode];
  var lsaltGridsForArea = lsaltData[gafAreaCode];
  if (mapAreas === undefined || mapAreas.length === 0 ||
    lsaltGridsForArea === undefined || lsaltGridsForArea.length === 0) {
    return;
  }
  if (layerIDsForLSALT[gafAreaCode]) {
    return;
  }
  layerIDsForLSALT[gafAreaCode] = [];

  lsaltGridsForArea.forEach(lsaltGrid => {
    wait.delay(1).then(() => {
      var grid = lsaltGrid.grid;
      var lsalt = lsaltGrid.lsalt_100ft;
      if (!nightVFR) {
        // assume pilot can see highest object; and that LSALT is 1300' higher than highest object
        lsalt -= 13;
      }

      var lsaltPolygon = turf.polygon([grid]);

      mapAreas.forEach(mapArea => {
        var mapAreaPolygon = mapArea.turfPolygon();

        var lsaltIntersection = turfintersect.default(mapAreaPolygon, lsaltPolygon)
        if (lsaltIntersection === undefined) {
          return;
        }

        var layerID = "lsalt" + random.UUID();
        layerIDsForLSALT[gafAreaCode].push(layerID);
        var areaCloudLayerBase = mapArea.cloudBase() === undefined ? 10000 : mapArea.cloudBase();
        var cloudBaseLSALTDelta = areaCloudLayerBase - (lsalt * 100);
        var layerColourIndex = Math.round(cloudBaseLSALTDelta / 1000);
        layerColourIndex = Math.min(3, Math.max(0, layerColourIndex));
        var layerColour = theme.current().cssHeightColors[layerColourIndex];

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

          map.on("mouseover", layerID, () => {
            map.setPaintProperty(layerID, "fill-opacity", 0.8);
            var text = "LSALT: " + lsaltGrid.lsalt_100ft;
            $('#mouseover-summary-lsalt-grid').text(text);
          });

          map.on("mouseleave", layerID, () => {
            map.setPaintProperty(layerID, "fill-opacity", 0.5);
          });
        }
      });
    })
  });
};
