"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gaftablerender = require("./gaftable");
const theme = require("../theme");
const mapui = require("../mapui");
const wait = require("../helpers/wait");
const turfcenter = require("../turf/center");
exports.byLayerID = {};
exports.allOutlineLayerIDs = [];
// mapArea is MapMajorArea or MapSubArea
function setupMapFill(mapArea) {
    let map = mapui.map;
    let baseID = mapArea.uuid();
    let layerID = mapArea.mapLayerID();
    exports.byLayerID[layerID] = mapArea;
    let labelID = "label" + baseID;
    let outlineID = "outline" + baseID;
    exports.allOutlineLayerIDs.push(outlineID);
    // 1000ft AGL matches to .height-1 in main.css
    let fillColor = mapArea.cloudBaseColor();
    let areaLayerFeature = mapArea.asFeature();
    map.addSource(layerID, {
        "type": "geojson",
        "data": areaLayerFeature,
    });
    map.addLayer({
        "id": layerID,
        "type": "fill",
        "source": layerID,
        "paint": {
            "fill-color": fillColor,
            "fill-opacity": 0.2,
        }
    });
    map.addLayer({
        "id": outlineID,
        "type": "line",
        "source": layerID,
        "layout": {
            "line-join": "round", "line-cap": "round",
        },
        "paint": {
            "line-color": fillColor, "line-width": 2,
        }
    });
    let areaCenter = turfcenter.center(areaLayerFeature, 1);
    areaCenter.properties = { "title": mapArea.mapLabel() };
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
            "text-color": theme.current().textColor,
        }
    });
    wait.delay(500).then(() => {
        gaftablerender.update();
    });
    //   let gafPageCode = document.gafPageCode
    //   map.on("mousemove", layerID, function(e) {
    //     table = gafTable();
    //     table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()}`).addClass("area-selected");
    //     if (mapArea.isSubArea()) {
    //       table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()} .subarea-mentioned-${mapArea.subAreaID()}`).addClass("sub-area-selected");
    //     }
    //   });
    //   map.on("mouseleave", layerID, function() {
    //     table = gafTable();
    //     table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()}`).removeClass("area-selected");
    //     if (mapArea.isSubArea()) {
    //       table.find(`tr.gaf-${mapArea.gafAreaCodeAndGroup()} .subarea-mentioned-${mapArea.subAreaID()}`).removeClass("sub-area-selected");
    //     }
    //   });
    //   map.on("mouseover", layerID, function(e) {
    //     let text = mapArea.mapLabel();
    //     if (mapArea.cloudBase() === undefined || mapArea.cloudBase() === 999999) {
    //       text += " has N/A clouds";
    //     } else {
    //       text += " has cloud base " + mapArea.cloudBase() + "MSL";
    //     }
    //     $('#mouseover-summary-area').text(text);
    //   });
    //   map.on('moveend', function(e){
    //     if(initialZoom){
    //       initialZoom = false;
    //       updateGAFTableFromVisibleAreas();
    //       updateLSALTFromVisibleAreas(nightVFR);
    //     }
    //  });
}
exports.setupMapFill = setupMapFill;
